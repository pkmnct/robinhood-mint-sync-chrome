// Update
// https://mint.intuit.com/settings.event?filter=property

import { Overlay } from "../../../utilities/overlay";
import { Debug } from "../../../utilities/debug";
import { waitForElement } from "../../../utilities/waitForElement";

const debug = new Debug("content", "Mint - Properties - Update");
const handleError = (error: Error) => debug.error(error);

new Overlay("Updating Mint Properties...", "This window will automatically close when the sync is complete");

chrome.runtime.onMessage.addListener((request) => {
  if (request.event === "robinhood-portfolio-scraped") {
    debug.log("Waiting for Property Tab View to load");
    waitForElement({
      selector: ".PropertyTabView",
      onError: handleError,
      callback: (propertyViewElement) => {
        debug.log("Property Tab View loaded.", propertyViewElement);

        let crypto = 0;
        let stocks = 0;
        let cash = 0;
        let other = 0;
        const syncedLabels = [];

        const onComplete = () => {
          // Wait for the saves to complete
          if (document.querySelectorAll(".AccountView.open").length) {
            setTimeout(onComplete, 50);
          } else {
            chrome.runtime.sendMessage({ event: "mint-sync-complete" });
          }
        };

        const callback = () => {
          if (syncedLabels.length === 4) {
            debug.log(`Fields updated. Attempting to save.`);
            const saveButtons = document.querySelectorAll(".saveButton");
            saveButtons.forEach((button) => {
              debug.log(`Clicking save`, button);
              button.removeAttribute("disabled");
              (button as HTMLInputElement).click();
            });
            onComplete();
          }
        };

        const setRobinhoodAmount = (label, amount) => {
          debug.log(`Attempting to set ${label} to ${amount}`);
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
                      callback();
                    }
                  });
                },
                initialContainer: foundElement,
              });
            },
          });
        };

        if (request.uninvested_cash) {
          cash = parseFloat(request.uninvested_cash) - parseFloat(request.cash_available_from_instant_deposits);
        }
        setRobinhoodAmount("Cash", cash);

        if (request.crypto) {
          crypto = parseFloat(request.crypto);
        }
        setRobinhoodAmount("Crypto", crypto);

        if (request.equities) {
          stocks = parseFloat(request.equities) - cash;
        }
        setRobinhoodAmount("Stocks", stocks);

        if (request.total_equity) {
          const combined = stocks + cash + crypto;
          const total = parseFloat(request.total_equity);
          if (total > combined) {
            other = total - combined;
          }
        }
        setRobinhoodAmount("Other", other);
      },
    });
  }
});
