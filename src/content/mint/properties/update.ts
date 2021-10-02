import { Message } from "../../../constants/interfaces";
import { Overlay } from "../../../utilities/overlay";
import { Debug } from "../../../utilities/debug";
import { waitForElement } from "../../../utilities/waitForElement";

const debug = new Debug("content", "Mint - Properties - Update");

/**
 * Handle errors by logging the error to the debug console.
 * @param error The error to handle
 */
const handleError = (error: Error) => debug.error(error);

/**
 * Runs once all the properties have been synced.
 * Sends message upon successful completion
 */
const updatesComplete = (params: { isMultipleAccounts: boolean; request: Message }) => {
  const { isMultipleAccounts, request } = params;

  // If an Account View is still open, the save has not yet completed.
  if (document.querySelectorAll(".AccountView.open").length) {
    setTimeout(() => updatesComplete(params), 50);
    return;
  }

  // Sync complete!
  chrome.runtime.sendMessage({
    event: "mint-sync-complete",
    account: isMultipleAccounts ? request.accountName : null,
  });
};

/**
 * Checks if we've synced enough properties,
 * if we have, save them and run the completion event
 */
const checkForUpdateComplete = (params: { syncedLabels: Array<string>; isMultipleAccounts: boolean; request: Message }) => {
  const { syncedLabels, isMultipleAccounts, request } = params;

  // Bail if we haven't synced enough labels yet.
  if (syncedLabels.length !== 4) {
    debug.log(`Synced ${syncedLabels.length} out of 4 properties`);
    return;
  }

  debug.log(`Fields updated. Attempting to save.`);
  const saveButtons = document.querySelectorAll(".saveButton");
  saveButtons.forEach((button) => {
    debug.log(`Clicking save`, button);
    button.removeAttribute("disabled");
    (button as HTMLInputElement).click();
  });
  updatesComplete({ isMultipleAccounts, request });
};

/**
 * Runs once all the properties have been synced.
 * Sends message upon successful completion
 */
interface SetRobinhoodAmountOptions {
  // Property to search for
  label: string;
  // Amount to set property to
  amount: number | null;
  // Labels synced so far
  syncedLabels: Array<string>;
  // If multiple accounts is active
  isMultipleAccounts: boolean; // TODO
  // Request from Robinhood scraper
  request: Message;
}
const setRobinhoodAmount = (options: SetRobinhoodAmountOptions) => {
  const { label, amount, syncedLabels, isMultipleAccounts, request } = options;

  const fullLabel = `Robinhood ${label}`;

  debug.log(`Attempting to set ${fullLabel} to ${amount}`);

  // Bail if amount is null, means we got bad data.
  if (amount === null || amount === NaN) {
    debug.log(`amount null for ${fullLabel}. Bailing.`);
    syncedLabels.push(label);
    chrome.runtime.sendMessage({
      event: "mint-unable-to-update-property",
      property: fullLabel,
    });
    // TODO: could call this with an arg that informs the user not everything was synced.
    checkForUpdateComplete({ syncedLabels, isMultipleAccounts, request });
    return;
  }

  waitForElement({
    selector: ".OtherPropertyView",
    onError: (error) => {
      debug.error(error);
      chrome.runtime.sendMessage({
        event: "mint-missing-property",
        property: fullLabel,
      });
    },
    withText: fullLabel,
    callback: (foundElement) => {
      debug.log(`Expanding property ${label}`, foundElement);
      foundElement.querySelector("span").click();

      waitForElement({
        selector: "input",
        onError: handleError,
        callback: () => {
          const inputs = foundElement.querySelectorAll("input") as NodeListOf<HTMLInputElement>;
          inputs.forEach((foundInput) => {
            if (foundInput.getAttribute("name") === "value") {
              debug.log(`Found ${label} input, setting amount`, foundInput);
              foundInput.value = `${amount}`;
              syncedLabels.push(label);
              checkForUpdateComplete({ syncedLabels, isMultipleAccounts, request });
            }
          });
        },
        initialContainer: foundElement,
      });
    },
  });
};

/**
 * Syncs the 4 created properties.
 *
 * @param propertyViewElement
 * @param callbackData
 */
const syncProperties = (propertyViewElement: HTMLElement, request: Message) => {
  debug.log("Property Tab View loaded.", propertyViewElement);
  debug.log("Request: ", request);

  chrome.storage.sync.get({ multipleAccountsEnabled: false, multipleAccounts: [] }, (result) => {
    const { multipleAccountsEnabled, multipleAccounts } = result;

    // Detect if Multiple Accounts && found a matching account to update
    let isMultipleAccounts = false;
    if (multipleAccountsEnabled) {
      debug.log("Multiple Accounts is enabled.");
      // Try to find a match in our existing accounts
      if (multipleAccounts && multipleAccounts.length) {
        isMultipleAccounts = multipleAccounts.some((account) => {
          if (account.robinHoodAccountName === request.accountName) {
            return true;
          }
          return false;
        });
      }

      // If no match, but we do have an account name, lets add it and bail out to the create step.
      if (!isMultipleAccounts && request.accountName) {
        debug.log("New Account found. Triggering setup for new account.");
        chrome.storage.sync.set({
          multipleAccounts: [...multipleAccounts, { robinHoodAccountName: request.accountName }],
        });

        // Open a setup page
        chrome.runtime.sendMessage({
          event: "mint-mutliple-account-trigger-setup",
          accountName: request.accountName,
        });
        return;
      }
    }

    // If we have multiple accounts, our label will get it added to the end.
    const subLabel = isMultipleAccounts ? ` - ${request.accountName}` : "";

    // Running label amount.
    const syncedLabels = [];

    // Amounts to set
    let crypto = null;
    let stocks = null;
    let cash = null;
    let other = null;

    // Cash
    if (request.uninvested_cash) {
      cash = parseFloat(request.uninvested_cash) - parseFloat(request.cash_available_from_instant_deposits);
    }
    setRobinhoodAmount({
      label: "Cash" + subLabel,
      amount: cash,
      syncedLabels,
      isMultipleAccounts,
      request,
    });

    // Crypto
    if (request.crypto) {
      crypto = parseFloat(request.crypto);
    }
    setRobinhoodAmount({
      label: "Crypto" + subLabel,
      amount: crypto,
      syncedLabels,
      isMultipleAccounts,
      request,
    });

    // Equities
    if (request.equities && cash !== null) {
      stocks = parseFloat(request.equities) - cash;
    }
    setRobinhoodAmount({
      label: "Stocks" + subLabel,
      amount: stocks,
      syncedLabels,
      isMultipleAccounts,
      request,
    });

    // Everything else
    debug.log("Pre Other:", { stocks, cash, crypto, other });
    if (request.total_equity && stocks !== null && stocks !== NaN && cash !== null && cash !== NaN && crypto !== null && crypto !== NaN) {
      const combined = stocks + cash + crypto;
      const total = parseFloat(request.total_equity);
      if (total !== NaN && total > combined) {
        other = total - combined;
      } else if (total === combined) {
        other = 0;
      }
      debug.log("Other calcs:", { combined, total, other });
    }
    setRobinhoodAmount({
      label: "Other" + subLabel,
      amount: other,
      syncedLabels,
      isMultipleAccounts,
      request,
    });
  });
};

/**
 * Binds to chrome runtime to begin the sync if we have scraped data.
 */
const onMessageListener = (request) => {
  // Only run if we've scraped some data
  if (request.event !== "robinhood-portfolio-scraped") {
    debug.error(`Received unexpected event`, request.event, request);
    return;
  }

  debug.log("Waiting for Property Tab View to load");
  waitForElement({
    selector: ".PropertyTabView",
    onError: handleError,
    callback: (foundElement) => syncProperties(foundElement, request),
  });
};

// Pop overlay
new Overlay("Updating Mint Properties...", "This window will automatically close when the sync is complete");

// Bind Listener
chrome.runtime.onMessage.addListener(onMessageListener);
