import { Overlay } from "../../../utilities/overlay";
import { waitForElement } from "../../../utilities/waitForElement";
import { Debug } from "../../../utilities/debug";

const debug = new Debug("content", "Mint - Properties - Create");
const handleError = (error: Error) => debug.error(error);

const params = new URLSearchParams(document.location.search);
const property = params.get("property");

// TODO: async await to get out of callback hell

if (property) {
  new Overlay(`Adding Robinhood ${property} property to Mint...`, "This window will automatically close when complete.");

  debug.log("Waiting for Add Property button.");
  waitForElement({
    selector: "#addProperty",
    onError: handleError,
    callback: (addPropertyButton) => {
      debug.log("Found add property button. Clicking it.", addPropertyButton);
      addPropertyButton.click();

      debug.log("Waiting for add other button.");
      waitForElement({
        selector: "#addOther",
        onError: handleError,
        callback: (addOtherButton) => {
          debug.log("Found add other button. Clicking it.", addOtherButton);
          addOtherButton.click();

          debug.log("Waiting for property type dropdown.");
          waitForElement({
            selector: ".propertyType",
            onError: handleError,
            callback: (propertyType) => {
              debug.log("Found property type dropdown. Looking for 'Collectible' option.", propertyType);

              // Find the "Collectible" type
              const options = propertyType.querySelectorAll("option");
              let option;
              options.forEach((thisOption) => {
                debug.log("Found 'Collectible' option.", thisOption);
                if (thisOption.innerText === "Collectible") {
                  option = thisOption.value;
                }
              });

              debug.log("Setting option", option);
              // Set the type to collectible
              (propertyType as HTMLInputElement).value = option;

              debug.log("Searching for Next button");
              waitForElement({
                selector: ".addPropertyModal .modal-btn-primary",
                onError: handleError,
                withText: "next",
                callback: (nextButton) => {
                  debug.log("Found next button, clicking", nextButton);
                  nextButton.click();

                  debug.log("Searching for Property Name field");
                  waitForElement({
                    selector: "#propertyName",
                    onError: handleError,
                    callback: (propertyName) => {
                      debug.log("Found Property Name field. Setting value.", propertyName);
                      (propertyName as HTMLInputElement).value = `Robinhood ${property}`;

                      debug.log("Setting Property Value");
                      (document.querySelector("#propertyValue") as HTMLInputElement).value = "0.00";

                      debug.log("Searching for Add Property button");
                      waitForElement({
                        selector: ".addPropertyModal .addProperty",
                        onError: handleError,
                        withText: "add it",
                        callback: (addPropertyButton) => {
                          debug.log("Found Add Property button. Clicking.", addPropertyButton);
                          addPropertyButton.click();

                          debug.log("Waiting for Property Added Success view");
                          waitForElement({
                            selector: ".AddPropertySuccessView",
                            onError: handleError,
                            callback: () => {
                              debug.log("Success screen found. Triggering mint-property-added event");
                              chrome.runtime.sendMessage({
                                event: "mint-property-added",
                              });
                            },
                          });
                        },
                      });
                    },
                  });
                },
              });
            },
          });
        },
      });
    },
  });
}
