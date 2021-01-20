// Check to see if properties are set up, and trigger set up if they are not
// https://mint.intuit.com/settings.event?filter=property&setupRobinhood=true

import { Overlay } from "../../../utilities/overlay";
import { waitForElement } from "../../../utilities/waitForElement";
import { Debug } from "../../../utilities/debug";

const debug = new Debug("content", "Mint - Properties - Check");

new Overlay("Performing Initial Setup. Please Wait...", "This window will automatically close when complete.");

// The properties to set up/check for
export const robinhoodProperties = ["Cash", "Stocks", "Crypto", "Other"];

// Function to check if the propert exists on the page
const checkIfPropertyExists = (property) => {
  debug.log("Checking if property exists:", property);

  const propertyElements = document.querySelectorAll(".OtherPropertyView");

  let foundProperty = false;
  for (const propertyElement of propertyElements) {
    if ((propertyElement as HTMLElement).innerText.includes(`Robinhood ${property}`)) {
      debug.log(`Found property "${property}"`, propertyElement);
      foundProperty = true;
      // Stop searching
      break;
    }
  }
  return foundProperty;
};

const setupProperties = () => {
  // Need to keep track of how many properties we added to ensure each gets set up before initiating sync
  let newProperties = 0;

  robinhoodProperties.forEach((property) => {
    if (!checkIfPropertyExists(property)) {
      debug.log(`Could not find "${property}", adding it.`);
      // Trigger setup of property
      chrome.runtime.sendMessage({
        event: "mint-create",
        property,
      });
      newProperties++;
    }
  });

  // Check for old version
  if (checkIfPropertyExists("Account")) {
    debug.log("Found old Robinhood Account property. This must be removed to finish setup.");
    chrome.runtime.sendMessage({
      event: "mint-property-remove",
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

debug.log("Waiting for .OtherPropertyView");
waitForElement({
  selector: ".OtherPropertyView",
  failureAttempts: 20,
  callback: (result) => {
    debug.log("Found Property View. Setting up properties.", result);
    setupProperties();
  },
  onError: () => {
    // If we don't find the OtherPropertyView, check if no properties are set up
    debug.log("Did not find property view. Checking for zeroState");
    waitForElement({
      selector: ".zeroState",
      callback: () => {
        setupProperties();
      },
      onError: (error) => debug.error("Did not find zero state", error),
      failureAttempts: 1, // We should fail right away if it doesn't exist. It's already waited many seconds for OtherPropertyView
    });
  },
});
