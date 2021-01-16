// Check to see if properties are set up, and trigger set up if they are not
// https://mint.intuit.com/settings.event?filter=property&setupRobinhood=true

import { Overlay } from "../../../utilities/overlay";
import { waitForElement } from "../../../utilities/waitForElement";

new Overlay(
  "Checking if Robinhood account set up in Mint...",
  "This window will automatically close when complete."
);

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

window.addEventListener("load", () => {
  waitForElement(".OtherPropertyView", null, () => {
    robinhoodProperties.forEach((property) => {
      if (!checkIfPropertyExists(property)) {
        // TODO: Trigger setup of property
        console.log("Need to set up " + property);
      }
    });
    if (checkIfPropertyExists("Account")) {
      // TODO: Need to remove the old way of storing portfolio balance
      console.log("Need to remove Account");
    }
  });
});
