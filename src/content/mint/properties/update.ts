// Update
// https://mint.intuit.com/settings.event?filter=property

// Constants.
import { callbackDataOptions } from "../../../constants/interfaces";

// Utilities.
import { Overlay } from "../../../utilities/overlay";
import { Debug } from "../../../utilities/debug";
import { waitForElement } from "../../../utilities/waitForElement";

// -------------------------------------------------------------------------------

const debug = new Debug("content", "Mint - Properties - Update");
const handleError = (error: Error) => debug.error(error);

// -------------------------------------------------------------------------------

const onMesageListener = (request) => {
  // Only run if we've scraped some data
  if (request.event !== "robinhood-portfolio-scraped") {
    return;
  }

  debug.log("Waiting for Property Tab View to load");
  waitForElement({
    selector: ".PropertyTabView",
    onError: handleError,
    callback: syncProperties,
    callbackData: { request },
  });
}

const setRobinhoodAmount = ({ label, amount, syncedLabels, match, request }) => {
  debug.log(`Attempting to set ${label} to ${amount}`);
  // Bail if amount is null, means we got bad data.
  if(amount === null || amount === NaN) {
    debug.log(`${amount} Null for ${label}. Bailing.`);
    syncedLabels.push(label);
    // TODO: could call this with an arg that informs the user not everything was synced.
    checkForUpdateComplete({ syncedLabels, match, request });
    return;
  }

  waitForElement({
    selector: ".OtherPropertyView",
    onError: handleError,
    withText: `Robinhood ${label}`,
    callback: (foundElement) => {
      debug.log(`Expanding property ${label}`, foundElement);
      foundElement.querySelector("span").click();

      waitForElement({
        selector: "input",
        onError: handleError,
        callback: () => {
          const inputs = foundElement.querySelectorAll("input");
          inputs.forEach((foundInput) => {
            if (foundInput.getAttribute("name") === "value") {
              debug.log(`Found ${label} input, setting amount`, foundInput);
              foundInput.value = amount;
              syncedLabels.push(label);
              checkForUpdateComplete({ syncedLabels, match, request });
            }
          });
        },
        initialContainer: foundElement,
      });
    },
  });
};

const checkForUpdateComplete = ({ syncedLabels, match, request }) => {
  // Bail if we haven't synced enough labels yet.
  if (syncedLabels.length !== 4) {
    return;
  }

  debug.log(`Fields updated. Attempting to save.`);
  const saveButtons = document.querySelectorAll(".saveButton");
  saveButtons.forEach((button) => {
    debug.log(`Clicking save`, button);
    button.removeAttribute("disabled");
    (button as HTMLInputElement).click();
  });
  updatesComplete({ match, request });
};

const updatesComplete = ({ match, request }) => {
  // Bail & Recur if no account view
  if (document.querySelectorAll(".AccountView.open").length) {
    setTimeout(updatesComplete, 50);
    return;
  }

  // Sync complete!
  chrome.runtime.sendMessage({
    event: "mint-sync-complete",
    account: match ? request.accountName : null,
  });
};
/**
 * 
 * @param propertyViewElement 
 * @param callbackData 
 */
const syncProperties = (propertyViewElement: HTMLElement,  callbackData: callbackDataOptions) => {
  const { request = {} } = callbackData;
  debug.log("Property Tab View loaded.", propertyViewElement);
  debug.log("Account Name: ", request.accountName);

  chrome.storage.sync.get({ multipleAccountsEnabled: false, multipleAccounts: [] }, (result) => {
    const { multipleAccountsEnabled, multipleAccounts } = result;
    
    // Detect if Multiple Accounts && found a matching account to update
    let match = false;
    if (multipleAccountsEnabled && multipleAccounts && multipleAccounts.length) {
      // Try to find a match
      match = multipleAccounts.some((account) => {
        if (account.robinHoodValue === request.accountName) {
          return true;
        }
        return false;
      });
    }

    // If we have multiple accounts, our label will get it added to the end.
    const subLabel = match ? ` - ${request.accountName}` : "";

    // Running label amount.
    const syncedLabels = [];

    // Amounts to set
    let crypto = null;
    let stocks = null;
    let cash = null;
    let other = null;

    // Cash
    if (request.uninvested_cash) {
      cash = parseFloat(request.uninvested_cash);
    }
    setRobinhoodAmount({ 
      label: "Cash" + subLabel, 
      amount: cash, 
      syncedLabels,
      match, 
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
      match, 
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
      match, 
      request, 
    });

    // Everything else
    if (request.total_equity && 
      stocks !== null && stocks !== NaN &&
      cash !== null  &&  cash !== NaN  &&  
      crypto!== null && crypto!== NaN
    ) {
      const combined = stocks + cash + crypto;
      const total = parseFloat(request.total_equity);
      if (total !== NaN && total > combined) {
        other = total - combined;
      }
    }
    setRobinhoodAmount({
      label: "Other" + subLabel, 
      amount: other, 
      syncedLabels, 
      match, 
      request, 
    });
  });
}


// Pop overlay 
new Overlay("Updating Mint Properties...", "This window will automatically close when the sync is complete");

chrome.runtime.onMessage.addListener( onMesageListener );
