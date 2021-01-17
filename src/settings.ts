const checkboxChangelog = document.querySelector(
  "#setting-changelogOnUpdate"
) as HTMLInputElement;
const checkboxTriangle = document.querySelector(
  "#setting-fixTriangle"
) as HTMLInputElement;
const checkboxDebug = document.querySelector(
  "#setting-debugMode"
) as HTMLInputElement;

chrome.storage.sync.get(
  { changelogOnUpdate: false, fixTriangle: true, debugMode: false },
  function (result) {
    // Changelog
    if (result.changelogOnUpdate) {
      checkboxChangelog.setAttribute("checked", "true");
    }

    checkboxChangelog.addEventListener("change", () => {
      chrome.storage.sync.set({
        changelogOnUpdate: checkboxChangelog.checked,
      });
    });

    // Triangle Fix
    if (result.fixTriangle) {
      checkboxTriangle.setAttribute("checked", "true");
    }
    checkboxTriangle.addEventListener("change", () => {
      chrome.storage.sync.set({
        fixTriangle: checkboxTriangle.checked,
      });
    });

    // Debug Mode
    if (result.debugMode) {
      checkboxDebug.setAttribute("checked", "true");
    }
    checkboxDebug.addEventListener("change", () => {
      chrome.storage.sync.set({
        debugMode: checkboxDebug.checked,
      });
    });
  }
);
