import { waitForElement } from "../../utilities/waitForElement";
import { Notification } from "../../utilities/notification";

// Wait a few seconds to start the sync, otherwise it will start before the login happens.
console.log("Test");
window.addEventListener("load", () => {
  waitForElement("#mintNavigation", null, () => {
    chrome.runtime.sendMessage({ event: "mint-opened" });
    if (window.location.href.indexOf("forceRobinhoodSync=true") !== -1) {
      new Notification("Syncing Mint with Robinhood.", true).show();
      chrome.runtime.sendMessage({ event: "mint-force-sync" });
    }
  });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (window.location.href.indexOf("forceRobinhoodSync=true") !== -1) {
    if (request.status == "Sync performed in the last hour. Not syncing.") {
      return;
    }
  }
  new Notification(request.status, request.persistent, {
    link: request.link,
    text: request.linkText,
    newTab: request.newTab,
  }).show();
});
