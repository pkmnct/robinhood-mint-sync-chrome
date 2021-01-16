import { urls } from "../urls";
import { log } from "../utilities/logging";

const logConfig = {
  type: "background",
  name: "Main",
};

log(logConfig, "initialized");

// Need to be able to access this regardless of the message.
let mintTab;

interface eventHandler {
  message: any;
  sender: chrome.runtime.MessageSender;
}

// The key of the handler should match the message.event value
const eventHandlers = {
  // This event is emitted by the main Robinhood content script.
  "robinhood-login-needed": ({ sender }: eventHandler) => {
    log(logConfig, "robinhood-login-needed event");
    chrome.tabs.sendMessage(mintTab, {
      status: "You need to log in to Robinhood",
      link: urls.robinhood.login,
      linkText: "Login",
      persistent: true,
      newTab: true,
    });
    chrome.tabs.remove(sender.tab.id);
  },
  // This event is emitted by the login Robinhood content script.
  "robinhood-login-success": ({ sender }: eventHandler) => {
    log(logConfig, "robinhood-login-success event");
    chrome.tabs.sendMessage(mintTab, { shouldReload: true });
    chrome.tabs.remove(sender.tab.id);
  },
  // This event is emitted by the main Robinhood content script.
  "robinhood-portfolio-scraped": ({ sender, message }: eventHandler) => {
    log(logConfig, "robinhood-portfolio-scraped event");
    // Trigger the Mint portfolio update content script
    chrome.tabs.create(
      {
        url: urls.mint.properties.update,
        active: false,
        openerTabId: mintTab,
      },
      (tab) => {
        chrome.tabs.sendMessage(tab.id, {
          uninvested_cash: message.uninvested_cash,
          total_market_value: message.total_market_value,
        });
      }
    );
    chrome.tabs.remove(sender.tab.id);
  },
  // TODO: is this event still needed?
  "mint-force-sync": () => {
    log(logConfig, "mint-force-sync event");
    // Trigger the main Robinhood sync script
    chrome.tabs.create({
      url: urls.robinhood.scrape,
      active: false,
      openerTabId: mintTab,
    });
  },
  // TODO: is this event still needed?
  "mint-robinhood-setup-complete": () => {
    log(logConfig, "mint-robinhood-setup-complete event");
    chrome.storage.sync.set({
      syncTime: "1970-01-01Z00:00:00:000",
    });
    // TODO: trigger first sync?
  },
  // This event is emitted by the Mint property update content script.
  "mint-sync-complete": () => {
    log(logConfig, "mint-sync-complete event");
    chrome.storage.sync.set({ syncTime: new Date().toString() });
    chrome.tabs.sendMessage(mintTab, {
      status: "Sync Complete! Reload to see the change.",
      link: "/overview.event",
      linkText: "Reload",
      persistent: true,
    });
  },
  // This event is emitted by the main Mint content script
  "mint-opened": ({ sender }) => {
    log(logConfig, "mint-opened event");
    // Store a reference to the mint tab to be able to show the notifications
    mintTab = sender.tab.id;
    chrome.storage.sync.get("syncTime", ({ syncTime }) => {
      if (!syncTime) {
        // Sync has not been set up
        chrome.tabs.sendMessage(mintTab, {
          status: "Robinhood account is not set up in Mint",
          persistent: true,
          link: urls.mint.properties.check,
          linkText: "Set up",
        });
      } else {
        const syncTimeParsed = new Date(syncTime);
        const currentTime = new Date();
        const differenceMilliseconds =
          currentTime.valueOf() - syncTimeParsed.valueOf();
        const differenceHours = Math.floor(
          (differenceMilliseconds % 86400000) / 3600000
        );
        if (differenceHours >= 1) {
          chrome.tabs.sendMessage(mintTab, {
            status: "Syncing Mint with Robinhood.",
            persistent: true,
          });

          // Trigger the Robinood sync content script
          chrome.tabs.create({
            url: urls.robinhood.scrape,
            active: false,
            openerTabId: mintTab,
          });
        } else {
          chrome.tabs.sendMessage(mintTab, {
            status: "Sync performed in the last hour. Not syncing.",
            link: urls.mint.forceSync,
            linkText: "Sync",
            persistent: false,
          });
        }
      }
    });
  },
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  eventHandlers[message.event]({ message, sender });
});
