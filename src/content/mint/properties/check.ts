// Check to see if properties are set up, and trigger set up if they are not
// https://mint.intuit.com/settings.event?filter=property&setupRobinhood=true

import { urls } from "../../../urls";
import { Overlay } from "../../../utilities/overlay";
import { waitForElement } from "../../../utilities/waitForElement";
import { Debug } from "../../../utilities/debug";

const debug = new Debug("content", "Mint - Properties - Check");

new Overlay(
  "Checking if Robinhood account set up in Mint...",
  "This window will automatically close when complete."
);

debug.log('Robinhood Mint Sync - Check: Overlay added.');

export const robinhoodProperties = ["Cash", "Stocks", "Crypto", "Other"];

const checkIfPropertyExists = (property) => {
  const propertyElements = document.querySelectorAll(".OtherPropertyView");
  let foundProperty = false;
  propertyElements.forEach((propertyElement) => {
    if (
      (propertyElement as HTMLElement).innerText.includes(
        `Robinhood ${property}`
      )
    ) {
      foundProperty = true;
    }
  });
  return foundProperty;
};

const checkForCreateProperties = () => {
  debug.log('Found Property View or Zero State.');
  let newProperties = 0;
  robinhoodProperties.forEach((property) => {
    if (!checkIfPropertyExists(property)) {
      debug.log(`Property doesn't exist: ${property}`);
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
    debug.log(`Found v2 property.`);
    chrome.runtime.sendMessage({
      event: "mint-property-remove",
    });
    return;
  }

  // Success.
  chrome.runtime.sendMessage({
    event: "mint-property-setup-complete",
    newProperties,
  });
}

window.addEventListener("load", () => {
  waitForElement({
    selector: ".OtherPropertyView",
    callback: checkForCreateProperties,
    failureCallback: () => {
      debug.log('Failed to find "Other" Property View. Checking for Zero State');
      waitForElement({
        selector: ".zeroState",
        callback: checkForCreateProperties,
      });
    },
  });
});
