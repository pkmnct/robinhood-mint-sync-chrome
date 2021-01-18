const checkboxChangelog = document.querySelector("#setting-changelogOnUpdate") as HTMLInputElement;
const checkboxTriangle = document.querySelector("#setting-fixTriangle") as HTMLInputElement;
const checkboxDebug = document.querySelector("#setting-debugMode") as HTMLInputElement;
const checkboxMultipleAccounts = document.querySelector("#setting-multipleAccountsEnabled") as HTMLInputElement;
const buttonMultipleAccountsAdd = document.querySelector("#multipleAccounts-add") as HTMLButtonElement;
const templateMultipleAccountsRow = document.querySelector("#mutiple-accounts-input-wrapper-template") as HTMLTemplateElement;
const wrapperMultipleAccountsRows = document.querySelector("#mutiple-account-rows") as HTMLElement;

chrome.storage.sync.get(
  {
    changelogOnUpdate: false,
    fixTriangle: true,
    debugMode: false,
    multipleAccountsEnabled: false,
    multipleAccounts: [{ robinHoodValue: "", mintValue: "" }],
  },
  (result) => {
    const { changelogOnUpdate, fixTriangle, debugMode, multipleAccountsEnabled, multipleAccounts } = result;
    // Changelog
    if (changelogOnUpdate) {
      checkboxChangelog.setAttribute("checked", "true");
    }

    checkboxChangelog.addEventListener("change", () => {
      chrome.storage.sync.set({
        changelogOnUpdate: checkboxChangelog.checked,
      });
    });

    // Triangle Fix Checkbox
    if (fixTriangle) {
      checkboxTriangle.setAttribute("checked", "true");
    }
    checkboxTriangle.addEventListener("change", () => {
      chrome.storage.sync.set({
        fixTriangle: checkboxTriangle.checked,
      });
    });

    // Debug Mode Checkbox
    if (debugMode) {
      checkboxDebug.setAttribute("checked", "true");
    }
    checkboxDebug.addEventListener("change", () => {
      chrome.storage.sync.set({
        debugMode: checkboxDebug.checked,
      });
    });

    // TODO: Validations
    // Multiple Accounts Checkbox
    if (multipleAccountsEnabled) {
      checkboxMultipleAccounts.setAttribute("checked", "true");
    }
    checkboxMultipleAccounts.addEventListener("change", () => {
      chrome.storage.sync.set({
        multipleAccountsEnabled: checkboxMultipleAccounts.checked,
      });

      // Clear out wrapper && re populate if needed.
      wrapperMultipleAccountsRows.innerHTML = "";
      if (checkboxMultipleAccounts.checked) {
        populateMultipleAccountFields(multipleAccounts);
      }
    });

    // Multiple Accounts Inputs
    if (multipleAccountsEnabled) {
      populateMultipleAccountFields(multipleAccounts);
    }
  }
);

/**
 * Populates the account row holder with the current array of accounts
 *
 * @param multipleAccounts - current array of accounts
 */
function populateMultipleAccountFields(multipleAccounts) {
  if (!multipleAccounts || !Array.isArray(multipleAccounts)) {
    return;
  }

  multipleAccounts.map((account, index) => {
    // Bail with bad data
    if (!account || typeof account !== "object") {
      return;
    }

    // Clone our template
    const clonedInputWrapper = templateMultipleAccountsRow.content.cloneNode(true) as HTMLElement;

    // Set values on new inputs
    const clonedRobinhoodInput = clonedInputWrapper.querySelector(`.setting-multipleAccounts-robinHoodInput`) as HTMLInputElement;
    clonedRobinhoodInput.id = `setting-multipleAccounts-robinHoodInput-${index}`;
    clonedRobinhoodInput.name = `setting-multipleAccounts-robinHoodInput-${index}`;
    clonedRobinhoodInput.value = account.robinHoodValue ? account.robinHoodValue : ""; // TODO: sanitize

    const clonedMintInput = clonedInputWrapper.querySelector(`.setting-multipleAccounts-mintInput`) as HTMLInputElement;
    clonedMintInput.id = `setting-multipleAccounts-mintInput-${index}`;
    clonedMintInput.name = `setting-multipleAccounts-mintInput-${index}`;
    clonedMintInput.value = account.mintValue ? account.mintValue : ""; // TODO: sanitize

    // Attach to row holder
    wrapperMultipleAccountsRows.appendChild(clonedInputWrapper);

    // Attach event listeners
    clonedRobinhoodInput.addEventListener("change", function () {
      multipleAccountInputChange(index, "robinHoodValue", this.value); // TODO: sanitize
    });

    clonedMintInput.addEventListener("change", function () {
      multipleAccountInputChange(index, "mintValue", this.value); // TODO: sanitize
    });
  });

  // Allow adding of inputs
  buttonMultipleAccountsAdd.addEventListener("click", multipleAccountsAddAction);

  // Allow Deletion of added inputs
  const buttonsMultipleAccountsDelete = document.querySelectorAll(".multipleAccounts-delete") as NodeListOf<HTMLButtonElement>;
  // loop through list items and add listener to click event
  for (const buttonMultipleAccountsDelete of buttonsMultipleAccountsDelete) {
    buttonMultipleAccountsDelete.addEventListener("click", multipleAccountsDeleteAction);
  }
}

function multipleAccountsAddAction() {
  buttonMultipleAccountsAdd.setAttribute("disabled", "true");

  const inputsWrappersMultipleAccounts = document.querySelectorAll(".mutiple-accounts-input-wrapper") as NodeListOf<HTMLElement>;
  const index = inputsWrappersMultipleAccounts.length;
  const clonedInputWrapper = templateMultipleAccountsRow.content.cloneNode(true) as HTMLElement;

  const thisRobinHoodInput = clonedInputWrapper.querySelector(`.setting-multipleAccounts-robinHoodInput`) as HTMLInputElement;
  thisRobinHoodInput.id = `setting-multipleAccounts-robinHoodInput-${index}`;
  thisRobinHoodInput.name = `setting-multipleAccounts-robinHoodInput-${index}`;
  thisRobinHoodInput.value = "";

  const thisMintInput = clonedInputWrapper.querySelector(`.setting-multipleAccounts-mintInput`) as HTMLInputElement;
  thisMintInput.id = `setting-multipleAccounts-mintInput-${index}`;
  thisMintInput.name = `setting-multipleAccounts-mintInput-${index}`;
  thisMintInput.value = "";

  const thisDeleteButton = clonedInputWrapper.querySelector(`.multipleAccounts-delete`) as HTMLButtonElement;

  wrapperMultipleAccountsRows.appendChild(clonedInputWrapper);

  thisRobinHoodInput.addEventListener("change", function () {
    multipleAccountInputChange(index, "robinHoodValue", this.value); // TODO: sanitize
  });

  thisMintInput.addEventListener("change", function () {
    multipleAccountInputChange(index, "mintValue", this.value); // TODO: sanitize
  });

  thisDeleteButton.addEventListener("click", multipleAccountsDeleteAction);
  buttonMultipleAccountsAdd.removeAttribute("disabled");
}

function multipleAccountInputChange(index, key, value) {
  chrome.storage.sync.get({ multipleAccounts: [] }, (result) => {
    // Bail with bad data
    if (!value || typeof value !== "string" || !key || typeof key !== "string" || !Number.isInteger(index) || index < 0) {
      return;
    }

    const { multipleAccounts } = result;
    const updatedMultipleAccounts = multipleAccounts;
    updatedMultipleAccounts[index] = {
      ...updatedMultipleAccounts[index],
      [key]: value, // TODO: sanitize
    };
    chrome.storage.sync.set({
      multipleAccounts: updatedMultipleAccounts,
    });
  });
}

function multipleAccountsDeleteAction() {
  const buttonMultipleAccountsDelete = document.querySelector(".multipleAccounts-delete") as HTMLButtonElement;
  buttonMultipleAccountsAdd.setAttribute("disabled", "true");
  buttonMultipleAccountsDelete.setAttribute("disabled", "true");

  const inputsWrappersMultipleAccounts = document.querySelectorAll(".mutiple-accounts-input-wrapper") as NodeListOf<HTMLElement>;
  const thisWrapper = this.parentElement;

  let thisIndex = 0;
  for (let x = 0; x < inputsWrappersMultipleAccounts.length; x++) {
    if (inputsWrappersMultipleAccounts[x] === thisWrapper) {
      thisIndex = x;
    }
  }

  // Bail if this is the first input
  if (thisIndex === 0) {
    buttonMultipleAccountsAdd.removeAttribute("disabled");
    buttonMultipleAccountsDelete.removeAttribute("disabled");
    return;
  }

  chrome.storage.sync.get({ multipleAccounts: [] }, (result) => {
    const { multipleAccounts } = result;
    const updatedMultipleAccounts = multipleAccounts;
    updatedMultipleAccounts.splice(thisIndex, 1);
    chrome.storage.sync.set({
      multipleAccounts: updatedMultipleAccounts,
    });
  });

  thisWrapper.remove();
  buttonMultipleAccountsAdd.removeAttribute("disabled");
  buttonMultipleAccountsDelete.removeAttribute("disabled");
}
