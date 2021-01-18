import { Overlay } from "../../../utilities/overlay";
import { waitForElement } from "../../../utilities/waitForElement";
import { Debug } from "../../../utilities/debug";

const debug = new Debug("content", "Mint - Properties - Create");

const params = new URLSearchParams(document.location.search);
const property = params.get("property");

if (property) {
  new Overlay(`Adding Robinhood ${property} property to Mint...`, "This window will automatically close when complete.");

  window.addEventListener("load", () => {
    debug.log("Waiting for Add Property button.");

    waitForElement("#addProperty", null, (addPropertyButton) => {
      debug.log("Found add property button. Clicking it.", addPropertyButton);

      addPropertyButton.click();

      debug.log("Waiting for add other button.");
      waitForElement("#addOther", null, (addOtherButton) => {
        debug.log("Found add other button. Clicking it.", addOtherButton);

        addOtherButton.click();

        debug.log("Waiting for property type dropdown.");
        waitForElement(".propertyType", null, (propertyType) => {
          debug.log("Found property type dropdown. Looking for 'Collectible' option.", propertyType);

          // Find the "Collectible" type
          const options = propertyType.querySelectorAll("option");
          let option;
          options.forEach((thisOption) => {
            if (thisOption.innerText === "Collectible") {
              debug.log("Found 'Collectible' option.", thisOption);
              option = thisOption.value;
            }
          });

          debug.log("Setting option", option);
          // Set the type to collectible
          (propertyType as HTMLInputElement).value = option;

          debug.log("Searching for Next button");
          waitForElement(".modal-btn-primary", "next", (nextButton) => {
            debug.log("Found next button, clicking", nextButton);
            nextButton.click();

            debug.log("Searching for Property Name field");
            waitForElement("#propertyName", null, (propertyName) => {
              debug.log("Found Property Name field. Setting value.", propertyName);
              (propertyName as HTMLInputElement).value = `Robinhood ${property}`;

              debug.log("Setting Property Value");
              (document.querySelector("#propertyValue") as HTMLInputElement).value = "0.00";

              debug.log("Searching for Add Property button");
              waitForElement(".addProperty", null, (addPropertyButton) => {
                debug.log("Found Add Property button. Clicking.");
                addPropertyButton.click();

                debug.log("Waiting for Property Added Success view");
                waitForElement(".AddPropertySuccessView", null, () => {
                  debug.log("Success screen found. Triggering mint-property-added event");
                  chrome.runtime.sendMessage({
                    event: "mint-property-added",
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}
