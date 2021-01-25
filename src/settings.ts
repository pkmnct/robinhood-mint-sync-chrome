const checkboxChangelog = document.querySelector("#setting-changelogOnUpdate") as HTMLInputElement;
const checkboxTriangle = document.querySelector("#setting-fixTriangle") as HTMLInputElement;
const checkboxDebug = document.querySelector("#setting-debugMode") as HTMLInputElement;
const checkboxMultipleAccounts = document.querySelector("#setting-multipleAccountsEnabled") as HTMLInputElement;

/**
 * Bind all of our Elemnents
 *
 */
chrome.storage.sync.get(
  {
    changelogOnUpdate: false,
    fixTriangle: true,
    debugMode: false,
    multipleAccountsEnabled: false,
    multipleAccounts: [{ robinHoodAccountName: "" }],
  },
  (result) => {
    const { changelogOnUpdate, fixTriangle, debugMode, multipleAccountsEnabled } = result;
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
      });
    });
  }
);
