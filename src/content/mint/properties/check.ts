// Check to see if properties are set up, and trigger set up if they are not
// https://mint.intuit.com/settings.event?filter=property&setupRobinhood=true

// Utilities.
import { Overlay } from "../../../utilities/overlay";
import { waitForElement } from "../../../utilities/waitForElement";
import { Debug } from "../../../utilities/debug";

// -------------------------------------------------------------------------------

const debug = new Debug("content", "Mint - Properties - Check");

// The properties to set up/check for
export const robinhoodProperties = ["Cash", "Stocks", "Crypto", "Other"];

// -------------------------------------------------------------------------------

/**
 *
 * @param propertyName - roperty name to look for
 * @param exactMatch - if true the propery can not contain any other extra characters
 */
const checkIfPropertyExists = (propertyName: string, exactMatch = true): boolean => {
  debug.log("Checking if property exists:", propertyName);

  const propertyElements = document.querySelectorAll(".OtherPropertyView");

  let foundProperty = false;
  for (const propertyElement of propertyElements) {
    const titleElement = propertyElement.querySelector(".summaryView span:first-child") as HTMLElement;
    const title = titleElement.innerText.trim();
    if (title === `Robinhood ${propertyName}`) {
      debug.log(`Found property "${propertyName}"`, propertyElement);
      foundProperty = true;
      // Stop searching
      break;
    } else if (!exactMatch && title.includes(`Robinhood ${propertyName}`)) {
      debug.log(`Found property "${propertyName}" - loose check`, propertyElement);
      foundProperty = true;
      break;
    }
  }
  return foundProperty;
};

/**
 * Loops through and checks if each propery needs to be created or not.
 *
 * @param subLabel - string to add to the end of the property name
 */
const checkAndCreateProperties = (subLabel = ""): number => {
  // Need to keep track of how many properties we added to ensure each gets set up before initiating sync
  let newProperties = 0;

  robinhoodProperties.forEach((property) => {
    const propertyName = property + subLabel;

    // Bail if the property is already here.
    if (checkIfPropertyExists(propertyName)) {
      debug.log(`Found "${propertyName}".`);
      return;
    }

    // Trigger setup of property
    debug.log(`Could not find "${propertyName}", adding it.`);
    chrome.runtime.sendMessage({
      event: "mint-create",
      property: propertyName,
    });
    newProperties++;
  });

  return newProperties;
};

/**
 * Setups up properties for a single account setup
 */
const singleAccountPropertiesSetup = (): void => {
  const newProperties = checkAndCreateProperties();

  // Check for old version
  if (checkIfPropertyExists("Account")) {
    debug.log("Found old Robinhood Account property. This must be removed to finish setup.");
    chrome.runtime.sendMessage({
      event: "mint-property-remove",
    });
    return;
  }

  // Check for old multiple account version
  let multipleCheck = false;
  robinhoodProperties.forEach((property) => {
    if (checkIfPropertyExists(`${property} -`, false)) {
      multipleCheck = true;
    }
  });
  if (multipleCheck) {
    debug.log("Found old Robinhood Multiple Account property. This must be removed to finish setup.");
    chrome.runtime.sendMessage({
      event: "mint-property-non-single-remove",
    });
    return;
  }

  // Success.
  debug.log("Finishing Setup");
  chrome.runtime.sendMessage({
    event: "mint-property-setup-complete",
    newProperties,
  });
};

/**
 * Setups up properties for a multiple account setup
 */
const multipleAccountPropertiesSetup = (multipleAccounts: Array<{ robinHoodAccountName: string }>): void => {
  // For each of our accounts, run through and check if we need to create any
  let newProperties = 0;
  multipleAccounts.forEach((account) => {
    const subLabel = ` - ${account.robinHoodAccountName}`;
    newProperties += checkAndCreateProperties(subLabel);
  });

  // Check for old version
  if (checkIfPropertyExists("Account")) {
    debug.log("Found old Robinhood Account property. This must be removed to finish setup.");
    chrome.runtime.sendMessage({
      event: "mint-property-remove",
    });
    return;
  }

  // Check for old non multiple account version
  // Check for old multiple account version
  let singleCheck = false;
  robinhoodProperties.forEach((property) => {
    if (checkIfPropertyExists(`${property}`)) {
      singleCheck = true;
    }
  });
  if (singleCheck) {
    debug.log("Found old Robinhood Non Multiple Account property. This must be removed to finish setup.");
    chrome.runtime.sendMessage({
      event: "mint-property-non-multiple-remove",
    });
    return;
  }

  // Success.
  debug.log("Finishing Setup");
  chrome.runtime.sendMessage({
    event: "mint-property-setup-complete",
    newProperties,
  });
};

/**
 * Determines account configuration and calls correct setup
 */
const setupProperties = (): void => {
  chrome.storage.sync.get(
    {
      multipleAccountsEnabled: false,
      multipleAccounts: [],
    },
    (data) => {
      const { multipleAccountsEnabled, multipleAccounts } = data;
      const isMultipleAccount = multipleAccountsEnabled && multipleAccounts && multipleAccounts.length;

      // Run setup based on our account configuration type
      isMultipleAccount ? multipleAccountPropertiesSetup(multipleAccounts) : singleAccountPropertiesSetup();
    }
  );
};

// Pop overlay
new Overlay("Performing Initial Setup. Please Wait...", "This window will automatically close when complete.");

// Wait for Properties view, with fallback if we are in a 0 state
debug.log("Waiting for .OtherPropertyView");
waitForElement({
  selector: ".OtherPropertyView",
  failureAttempts: 20,
  callback: () => {
    debug.log("Found Property View. Setting up properties.");
    setupProperties();
  },
  onError: () => {
    // If we don't find the OtherPropertyView, check if no properties are set up
    debug.log("Did not find property view. Checking for zeroState");
    waitForElement({
      selector: ".zeroState",
      callback: () => {
        debug.log("Found Zero State. Setting up properties.");
        setupProperties();
      },
      onError: (error) => debug.error("Did not find zero state", error),
      failureAttempts: 1, // We should fail right away if it doesn't exist. It's already waited many seconds for OtherPropertyView
    });
  },
});
