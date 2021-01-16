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

    // Close the Robinhood tab logged in from
    chrome.tabs.remove(sender.tab.id);

    // Trigger the sync
    chrome.tabs.create({
      url: urls.robinhood.scrape,
      active: false,
      openerTabId: mintTab,
    });

    // Switch focus back to Mint
    chrome.tabs.update(mintTab, {
      selected: true,
    });
  },
  // This event is emitted by the main Robinhood content script.
  "robinhood-portfolio-scraped": ({ sender, message }: eventHandler) => {
    log(logConfig, "robinhood-portfolio-scraped event");
    // Trigger the Mint portfolio update content script
    chrome.tabs.create(
      {
        url: urls.mint.properties.update,
        active: false,
        openerTabId: sender.tab.id,
      },
      (tab) => {
        const checkIfLoaded = () => {
          chrome.tabs.get(tab.id, (tab) => {
            if (tab.status === "complete") {
              // Once the tab is loaded, pass the message to it
              chrome.tabs.sendMessage(tab.id, message);
              clearInterval(sendMessageInterval);
            }
          });
        };
        const sendMessageInterval = setInterval(checkIfLoaded, 200);
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
  // This event is emitted by the Mint property create content script.
  "mint-property-added": ({ sender }: eventHandler) => {
    log(logConfig, "mint-property-added event");
    chrome.tabs.remove(sender.tab.id);
  },
  // This event is emitted by the Mint property check content script.
  "mint-property-setup-complete": ({ sender }: eventHandler) => {
    log(logConfig, "mint-property-setup-complete event");
    chrome.tabs.remove(sender.tab.id);
    chrome.tabs.sendMessage(mintTab, {
      status: "Setup complete! Initiating Sync.",
      persistent: true,
    });

    // Trigger the Robinood sync content script
    chrome.tabs.create({
      url: urls.robinhood.scrape,
      active: false,
      openerTabId: mintTab,
    });

    // Switch focus back to Mint
    chrome.tabs.update(mintTab, {
      selected: true,
    });
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
  "mint-opened": ({ sender }: eventHandler) => {
    log(logConfig, "mint-opened event");
    // Store a reference to the mint tab to be able to show the notifications
    mintTab = sender.tab.id;
    chrome.storage.sync.get("syncTime", ({ syncTime }) => {
      if (!syncTime) {
        // Sync has not been set up
        chrome.tabs.sendMessage(mintTab, {
          status:
            "You have not yet performed a sync on this device. You must run an initial setup.",
          persistent: true,
          link: urls.mint.properties.check,
          linkText: "Set up",
          newTab: true,
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
  // This event is emitted by the Mint property check content script.
  "mint-create": ({ message, sender }: eventHandler) => {
    chrome.tabs.create({
      url: urls.mint.properties.create + "&property=" + message.property,
      active: false,
    });
  },
  // This event is emitted by the Mint property check content script.
  "mint-remove": ({ message, sender }: eventHandler) => {
    // TODO: Alert user to remove old account property
  },
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  eventHandlers[message.event]({ message, sender });
});