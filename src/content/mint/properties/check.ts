// Check to see if properties are set up, and trigger set up if they are not
// https://mint.intuit.com/settings.event?filter=property&setupRobinhood=true

import { Overlay } from "../../../utilities/overlay";
import { waitForElement } from "../../../utilities/waitForElement";
import { Debug } from "../../../utilities/debug";

const debug = new Debug("content", "Mint - Properties - Check");

new Overlay("Checking if Robinhood account set up in Mint...", "This window will automatically close when complete.");

export const robinhoodProperties = ["Cash", "Stocks", "Crypto", "Other"];

const checkIfPropertyExists = (property) => {
  debug.log("Checking if property exists:", property);
  const propertyElements = document.querySelectorAll(".OtherPropertyView");
  let foundProperty = false;
  propertyElements.forEach((propertyElement) => {
    if ((propertyElement as HTMLElement).innerText.includes(`Robinhood ${property}`)) {
      debug.log(`Found property "${property}"`, propertyElement);
      foundProperty = true;
    }
  });
  return foundProperty;
};

window.addEventListener("load", () => {
  debug.log("Waiting for .OtherPropertyView");
  waitForElement(".OtherPropertyView", null, () => {
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
    if (checkIfPropertyExists("Account")) {
      debug.log("Found old Robinhood Account property. This must be removed to finish setup.");
      chrome.runtime.sendMessage({
        event: "mint-property-remove",
      });
    } else {
      debug.log("Finishing Setup");
      chrome.runtime.sendMessage({
        event: "mint-property-setup-complete",
        newProperties,
      });
    }
  });
});
