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
    multipleAccounts: [{ robinHoodValue: "" }],
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

    // Multiple Accounts Checkbox
    if (multipleAccountsEnabled) {
      checkboxMultipleAccounts.setAttribute("checked", "true");
    }
    checkboxMultipleAccounts.addEventListener("change", () => {
      chrome.storage.sync.set({
        multipleAccountsEnabled: checkboxMultipleAccounts.checked,
        propertiesSetup: false,
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

    // Allow adding of inputs
    buttonMultipleAccountsAdd.addEventListener("click", multipleAccountsAddAction);
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
    clonedRobinhoodInput.value = account.robinHoodValue ? sanitizeInput(account.robinHoodValue) : "";
    if (!passedValidation(clonedRobinhoodInput.value)) {
      clonedRobinhoodInput.classList.add("error");
    }

    // Attach to row holder
    wrapperMultipleAccountsRows.appendChild(clonedInputWrapper);

    // Attach event listeners
    clonedRobinhoodInput.addEventListener("change", function () {
      const value = this.value;
      if (!passedValidation(value)) {
        this.classList.add("error");
        return;
      }

      this.classList.remove("error");
      multipleAccountInputChange(index, "robinHoodValue", value);
    });
  });

  // Allow Deletion of added inputs
  const buttonsMultipleAccountsDelete = document.querySelectorAll(".multipleAccounts-delete") as NodeListOf<HTMLButtonElement>;
  // loop through list items and add listener to click event
  for (const buttonMultipleAccountsDelete of buttonsMultipleAccountsDelete) {
    buttonMultipleAccountsDelete.addEventListener("click", multipleAccountsDeleteAction);
  }
}

/**
 * Action for add click event handler
 *
 * @param multipleAccounts - current array of accounts
 */
function multipleAccountsAddAction() {
  // Disable add button
  buttonMultipleAccountsAdd.setAttribute("disabled", "true");

  // Find our index for the new row
  const inputsWrappersMultipleAccounts = document.querySelectorAll(".mutiple-accounts-input-wrapper") as NodeListOf<HTMLElement>;
  const index = inputsWrappersMultipleAccounts.length;

  // If we don't have any inputs, something has gone wrong. just bail.
  if (index === 0) {
    return;
  }

  // Clone our template
  const clonedInputWrapper = templateMultipleAccountsRow.content.cloneNode(true) as HTMLElement;

  // Set values on new inputs
  const thisRobinHoodInput = clonedInputWrapper.querySelector(`.setting-multipleAccounts-robinHoodInput`) as HTMLInputElement;
  thisRobinHoodInput.id = `setting-multipleAccounts-robinHoodInput-${index}`;
  thisRobinHoodInput.name = `setting-multipleAccounts-robinHoodInput-${index}`;
  thisRobinHoodInput.value = "";

  const thisDeleteButton = clonedInputWrapper.querySelector(`.multipleAccounts-delete`) as HTMLButtonElement;

  // Attach to row holder
  wrapperMultipleAccountsRows.appendChild(clonedInputWrapper);

  // Attach event listeners
  thisRobinHoodInput.addEventListener("change", function () {
    const value = this.value;
    if (!passedValidation(value)) {
      this.classList.add("error");
      return;
    }

    this.classList.remove("error");
    multipleAccountInputChange(index, "robinHoodValue", value);
  });

  thisDeleteButton.addEventListener("click", multipleAccountsDeleteAction);

  // Reenable add button
  buttonMultipleAccountsAdd.removeAttribute("disabled");
}

// TODO
function passedValidation(value) {
  if (!value) {
    return false;
  }

  return true;
}

// TODO
function sanitizeInput(input) {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}

/**
 * Action for delete click event handler
 *
 * @param multipleAccounts - current array of accounts
 */
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

/**
 * Sets value for multipleAccount keys in storage
 *
 * @param index - current index
 * @param key - key to update
 * @param value - value to update to
 */
function multipleAccountInputChange(index, key, value) {
  chrome.storage.sync.get({ multipleAccounts: [] }, (result) => {
    // Bail with bad data
    if (typeof value !== "string" || !key || typeof key !== "string" || !Number.isInteger(index) || index < 0) {
      return;
    }

    const { multipleAccounts } = result;
    const updatedMultipleAccounts = multipleAccounts;
    updatedMultipleAccounts[index] = {
      ...updatedMultipleAccounts[index],
      [key]: sanitizeInput(value),
    };
    chrome.storage.sync.set({
      multipleAccounts: updatedMultipleAccounts,
    });
  });
}
