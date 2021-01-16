import { log } from "../utilities/logging";
const logConfig = {
  type: "background",
  name: "Update/Install Listener",
};

log(logConfig, "initialized");

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    // When the extension is installed
    log(logConfig, "install detected");
    window.open(chrome.extension.getURL("html/welcome.html"), "_blank");
  } else if (details.reason === "update") {
    // When the extension is updated
    log(logConfig, "update detected");
    chrome.storage.sync.set({ updated: true });
  }
});
