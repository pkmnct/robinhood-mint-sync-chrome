import { Debug } from "../utilities/debug";

const debug = new Debug("background", "Update/Install Listener");

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    // When the extension is installed
    debug.log("install detected");
    window.open(chrome.extension.getURL("html/welcome.html"), "_blank");
  } else if (details.reason === "update") {
    // When the extension is updated
    debug.log("update detected");
    chrome.storage.sync.set({ updated: true });
  }
});
