import { Overlay } from "../../../utilities/overlay";
import { waitForElement } from "../../../utilities/waitForElement";
import { Debug } from "../../../utilities/debug";

const debug = new Debug("content", "Mint - Properties - Create");

const params = new URLSearchParams(document.location.search);
const property = params.get("property");

debug.log('Robinhood Mint Sync - Create: Script Running.');

if (property) {
  new Overlay(
    `Adding Robinhood ${property} property to Mint...`,
    "This window will automatically close when complete."
  );

  window.addEventListener("load", () => {
    waitForElement({
      selector: "#addProperty",
      callback: () => {
        debug.log('#AddProperty Found.');
        (document.querySelector("#addProperty") as HTMLElement).click();

        waitForElement({
          selector: "#addOther",
          callback: () => {
            (document.querySelector("#addOther") as HTMLElement).click();

            waitForElement({
              selector: ".propertyType",
              callback: () => {
                debug.log(`Found Property Type Field. Selecting "Collectible"...`);
                // Find the type dropdown
                const select = document.querySelector(
                  ".propertyType"
                ) as HTMLInputElement;

                // Find the "Collectible" type
                const options = document.querySelectorAll(".propertyType option");
                let option;
                options.forEach((thisOption) => {
                  if ((thisOption as HTMLInputElement).innerText === "Collectible") {
                    option = (thisOption as HTMLInputElement).value;
                  }
                });

                // Set the type to collectible
                select.value = option;

                waitForElement({
                  selector: ".addPropertyModal .modal-btn-primary",
                  withText: "next",
                  callback: (button) => {
                    debug.log(`Found Next Button. Clicking...`);
                    button.click();

                    waitForElement({
                      selector: "#propertyName",
                      callback: () => {
                        debug.log(`Found Property Name Field. Filling out...`);
                        (document.querySelector(
                          "#propertyName"
                        ) as HTMLInputElement).value = `Robinhood ${property}`;
                        (document.querySelector(
                          "#propertyValue"
                        ) as HTMLInputElement).value = "0.00";

                        waitForElement({
                          selector: ".addPropertyModal .addProperty",
                          withText: "add it",
                          callback: (button) => {
                            debug.log(`Found Add It Button. Clicking...`);
                            button.click();

                            waitForElement({
                              selector: ".AddPropertySuccessView",
                              callback: () => {
                                debug.log(`Found Success View.`);
                                chrome.runtime.sendMessage({
                                  event: "mint-property-added",
                                });
                              }
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  });
}
