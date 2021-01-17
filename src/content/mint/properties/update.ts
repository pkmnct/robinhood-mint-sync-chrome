// Update
// https://mint.intuit.com/settings.event?filter=property

import { Overlay } from "../../../utilities/overlay";
import { Debug } from "../../../utilities/debug";
import { waitForElement } from "../../../utilities/waitForElement";

const debug = new Debug("content", "Mint - Properties - Update");

new Overlay(
  "Syncing Mint and Robinhood...",
  "This window will automatically close when the sync is complete"
);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.event === "robinhood-portfolio-scraped") {
    debug.log("Waiting for Property Tab View to load");
    waitForElement(".PropertyTabView", null, () => {
      debug.log("Property Tab View loaded.");

      let crypto = 0;
      let stocks = 0;
      let cash = 0;
      let other = 0;
      const syncedLabels = [];

      function closeWindow() {
        if (document.querySelectorAll(".AccountView.open").length) {
          setTimeout(closeWindow, 50);
        } else {
          chrome.runtime.sendMessage({ event: "mint-sync-complete" });
          if (!debug.isEnabled()) window.close();
        }
      }

      const callback = () => {
        if (syncedLabels.length === 4) {
          debug.log(`Fields updated. Attempting to save.`);
          const saveButtons = document.querySelectorAll(".saveButton");
          saveButtons.forEach((button) => {
            debug.log(`Clicking save`);
            button.removeAttribute("disabled");
            (button as HTMLInputElement).click();
          });
          closeWindow();
        }
      };

      function setRobinhoodAmount(label, amount) {
        debug.log(`Attempting to set ${label} to ${amount}`);
        // Find the property that contains the label
        const otherProperties = document.querySelectorAll(".OtherPropertyView");
        let property;
        otherProperties.forEach((thisProperty) => {
          if ((thisProperty as HTMLElement).innerText.includes(label)) {
            property = thisProperty;
            return;
          }
        });

        if (property) {
          property.querySelector("span").click();

          const robinhoodInputs = property.querySelectorAll("input");

          if (robinhoodInputs[0].value === `Robinhood ${label}`) {
            debug.log(`Found ${label} input, setting amount`);
            robinhoodInputs[1].value = amount;
            syncedLabels.push(label);
            callback();
          }
        } else {
          setTimeout(() => setRobinhoodAmount(label, amount), 50);
        }
      }

      if (request.uninvested_cash) {
        cash = parseFloat(request.uninvested_cash);
      }
      setRobinhoodAmount("Cash", cash);

      if (request.crypto) {
        crypto = parseFloat(request.crypto);
      }
      setRobinhoodAmount("Crypto", crypto);

      if (request.equities) {
        stocks = parseFloat(request.equities);
      }
      setRobinhoodAmount("Stocks", stocks);

      if (request.total_market_value) {
        const combined = stocks + cash + crypto;
        const total = parseFloat(request.total_market_value);
        if (total > combined) {
          other = total - combined;
        }
      }
      setRobinhoodAmount("Other", other);
    });
  }
});
