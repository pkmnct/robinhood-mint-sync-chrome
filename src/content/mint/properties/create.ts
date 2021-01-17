import { Overlay } from "../../../utilities/overlay";
import { waitForElement } from "../../../utilities/waitForElement";
import { Debug } from "../../../utilities/debug";

const debug = new Debug("content", "Mint - Properties - Create");

const params = new URLSearchParams(document.location.search);
const property = params.get("property");

if (property) {
  new Overlay(
    `Adding Robinhood ${property} property to Mint...`,
    "This window will automatically close when complete."
  );

  window.addEventListener("load", () => {
    waitForElement("#addProperty", null, () => {
      (document.querySelector("#addProperty") as HTMLElement).click();

      waitForElement("#addOther", null, () => {
        (document.querySelector("#addOther") as HTMLElement).click();

        waitForElement(".propertyType", null, () => {
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

          waitForElement(".modal-btn-primary", "next", () => {
            (document.querySelector(
              ".modal-btn-primary"
            ) as HTMLElement).click();

            waitForElement("#propertyName", null, () => {
              (document.querySelector(
                "#propertyName"
              ) as HTMLInputElement).value = `Robinhood ${property}`;
              (document.querySelector(
                "#propertyValue"
              ) as HTMLInputElement).value = "0.00";

              waitForElement(".addProperty", null, () => {
                (document.querySelector(".addProperty") as HTMLElement).click();

                waitForElement(".AddPropertySuccessView", null, () => {
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
