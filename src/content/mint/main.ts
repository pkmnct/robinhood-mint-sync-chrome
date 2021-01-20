import { waitForElement } from "../../utilities/waitForElement";
import { Notification } from "../../utilities/notification";
import { Debug } from "../../utilities/debug";

const debug = new Debug("content", "Mint - Main");

waitForElement({
  selector: "#mintNavigation",
  callback: () => {
    debug.log("Detected Mint Overview Page");
    chrome.runtime.sendMessage({ event: "mint-opened" });
    if (window.location.href.indexOf("forceRobinhoodSync=true") !== -1) {
      debug.log("Forcing sync");
      chrome.runtime.sendMessage({ event: "trigger-sync" });
    }
  },
  onError: (error) => debug.error("It appears Mint has not signed in", error),
});

chrome.runtime.onMessage.addListener((request) => {
  if (window.location.href.indexOf("forceRobinhoodSync=true") !== -1) {
    if (request.status == "Sync performed in the last hour. Not syncing.") {
      debug.log("Ignoring message since we are forcing sync.");
      return;
    }
  }
  debug.log("Displaying Notification", status);
  new Notification(request.status, request.persistent, {
    link: request.link,
    text: request.linkText,
    newTab: request.newTab,
  }).show();
});
