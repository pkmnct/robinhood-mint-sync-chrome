import { log } from "../utilities/logging";
const logConfig = {
  type: "background",
  name: "Browser Action",
};

log(logConfig, "initialized");

chrome.browserAction.onClicked.addListener((tab) => {
  log(logConfig, "browser action triggered");
  chrome.tabs.create({
    url: chrome.extension.getURL("html/welcome.html"),
    active: true,
    openerTabId: tab.id,
  });
});
