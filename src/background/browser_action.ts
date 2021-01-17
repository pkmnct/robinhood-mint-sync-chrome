import { Debug } from "../utilities/debug";

const debug = new Debug("background", "Browser Action");

chrome.browserAction.onClicked.addListener((tab) => {
  debug.log("browser action triggered");
  chrome.tabs.create({
    url: chrome.extension.getURL("html/welcome.html"),
    active: true,
    openerTabId: tab.id,
  });
});
