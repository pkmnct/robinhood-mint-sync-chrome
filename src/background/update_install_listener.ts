chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    // When the extension is installed
    window.open(chrome.extension.getURL("pages/welcome/"), "_blank");
  } else if (details.reason === "update") {
    // When the extension is updated
    // TODO: set up a notification to show that the extension was updated, with a link to changelog
  }
});
