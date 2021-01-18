import { Message } from "../content/robinhood/main";
import { urls } from "../urls";
import { Debug } from "../utilities/debug";

const debug = new Debug("background", "Main");

// Need to be able to access this regardless of the message.
let mintTab: undefined | number;
let newProperties = 0;
let newPropertiesComplete = 0;

interface eventHandler {
  message: Message;
  sender: chrome.runtime.MessageSender;
}

// The key of the handler should match the message.event value
const eventHandlers = {
  "trigger-sync": () => {
    debug.log("trigger-sync event");
    // Send notification
    chrome.tabs.sendMessage(mintTab, {
      status: "Syncing Mint with Robinhood.",
      persistent: true,
    });

    // Trigger the sync
    chrome.tabs.create({
      url: urls.robinhood.scrape,
      active: false,
    });
  },
  // This event is emitted by the main Robinhood content script.
  "robinhood-login-needed": ({ sender }: eventHandler) => {
    debug.log("robinhood-login-needed event");
    chrome.tabs.sendMessage(mintTab, {
      status: "You need to log in to Robinhood",
      link: urls.robinhood.login,
      linkText: "Login",
      persistent: true,
      newTab: true,
    });
    if (!debug.isEnabled()) chrome.tabs.remove(sender.tab.id);
  },
  // This event is emitted by the login Robinhood content script.
  "robinhood-login-success": ({ sender }: eventHandler) => {
    debug.log("robinhood-login-success event");

    // Close the Robinhood tab logged in from
    if (!debug.isEnabled()) chrome.tabs.remove(sender.tab.id);

    eventHandlers["trigger-sync"]();

    // Switch focus back to Mint
    chrome.tabs.update(mintTab, {
      selected: true,
    });
  },
  // This event is emitted by the main Robinhood content script.
  "robinhood-portfolio-scraped": ({ sender, message }: eventHandler) => {
    debug.log("robinhood-portfolio-scraped event");
    // Trigger the Mint portfolio update content script
    chrome.tabs.create(
      {
        url: urls.mint.properties.update,
        active: false,
      },
      (tab) => {
        debug.log("waiting for Mint tab to load");
        const checkIfLoaded = () => {
          if (!tab) {
            clearInterval(sendMessageInterval);
            debug.log("Unexpected: Tab was not found. Clearing interval to prevent endless loop. Did the tab get closed?");
          } else {
            chrome.tabs.get(tab.id, (tab) => {
              if (tab.status === "complete") {
                // Once the tab is loaded, pass the message to it
                chrome.tabs.sendMessage(tab.id, message);
                clearInterval(sendMessageInterval);
                debug.log("Mint tab loaded");
              }
            });
          }
        };
        const sendMessageInterval = setInterval(checkIfLoaded, 200);
      }
    );
    if (!debug.isEnabled()) chrome.tabs.remove(sender.tab.id);
  },
  // This event is emitted by the Mint property create content script.
  "mint-property-added": ({ sender }: eventHandler) => {
    debug.log("mint-property-added event");
    newPropertiesComplete++;
    if (!debug.isEnabled()) chrome.tabs.remove(sender.tab.id);

    debug.log(`Setup ${newPropertiesComplete} of ${newProperties} properties.`);
    if (newPropertiesComplete === newProperties) {
      eventHandlers["setup-complete"]();
    }
  },
  // This event is emitted by the mint-property-added and/or the mint-property-setup-complete event handlers
  "setup-complete": () => {
    debug.log("setup-complete event");
    debug.log("setup-complete sending notification");
    chrome.tabs.sendMessage(mintTab, {
      status: "Setup complete!",
    });

    debug.log("setup-complete triggering sync");
    eventHandlers["trigger-sync"]();

    debug.log("setup-complete switching focus back to Mint");
    // Switch focus back to Mint
    chrome.tabs.update(mintTab, {
      selected: true,
    });
  },
  // This event is emitted by the Mint property check content script.
  "mint-property-setup-complete": ({ sender, message }: eventHandler) => {
    debug.log("mint-property-setup-complete event");

    debug.log("mint-property-setup-complete setting storage");
    chrome.storage.sync.set({
      propertiesSetup: true,
      needsOldPropertyRemoved: false,
    });

    if (!debug.isEnabled()) chrome.tabs.remove(sender.tab.id);

    newProperties = parseInt(message.newProperties);
    debug.log(`Setting up ${newProperties} properties.`);
    if (newProperties === 0) {
      eventHandlers["setup-complete"]();
    }
  },
  // This event is emitted by the Mint property update content script.
  "mint-sync-complete": () => {
    debug.log("mint-sync-complete event");
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
    debug.log("mint-opened event");
    // Store a reference to the mint tab to be able to show the notifications
    mintTab = sender.tab.id;

    chrome.storage.sync.get(
      ["syncTime", "propertiesSetup", "needsOldPropertyRemoved", "updated"],
      ({ syncTime, propertiesSetup, needsOldPropertyRemoved, updated }) => {
        if (updated) {
          chrome.tabs.sendMessage(mintTab, {
            status: "Robinhood Mint Sync for Chrome has updated.",
            persistent: true,
            link: urls.extension.changelog,
            linkText: "View Changelog",
            newTab: true,
          });
          // TODO: only dismiss changelog after it's been viewed?
          chrome.storage.sync.set({ updated: false });
        }
        if (needsOldPropertyRemoved) {
          chrome.tabs.create({
            url: urls.mint.properties.check,
            active: false,
          });
        } else if (!propertiesSetup || !syncTime) {
          // Sync has not been set up
          chrome.tabs.sendMessage(mintTab, {
            status: "You have not yet performed a sync on this device. You must run an initial setup.",
            persistent: false,
            link: urls.mint.properties.check,
            linkText: "Set up",
            newTab: true,
          });
        } else {
          const syncTimeParsed = new Date(syncTime);
          const currentTime = new Date();
          const differenceMilliseconds = currentTime.valueOf() - syncTimeParsed.valueOf();
          const differenceHours = Math.floor((differenceMilliseconds % 86400000) / 3600000);
          if (differenceHours >= 1) {
            eventHandlers["trigger-sync"]();
          } else {
            chrome.tabs.sendMessage(mintTab, {
              status: "Sync performed in the last hour. Not syncing.",
              link: urls.mint.forceSync,
              linkText: "Sync",
              persistent: false,
            });
          }
        }
      }
    );
  },
  // This event is emitted by the Mint property check content script.
  "mint-create": ({ message }: eventHandler) => {
    debug.log("mint-create event");
    chrome.tabs.create({
      url: urls.mint.properties.create + "&property=" + message.property,
      active: false,
    });
  },
  // This event is emitted by the Mint property check content script.
  "mint-property-remove": ({ sender }: eventHandler) => {
    debug.log("mint-property-remove event");
    chrome.tabs.sendMessage(mintTab, {
      status:
        "Your account was set up prior to version 3 of this extension. Version 3 introduced separation of asset types when syncing. Please remove the old 'Robinhood Account' property from Mint to prevent duplication of your portfolio balance. Reload the overview to sync after removing the property.",
      persistent: true,
      link: "https://mint.intuit.com/settings.event?filter=property",
      linkText: "Mint Properties",
      newTab: true,
    });
    chrome.storage.sync.set({ needsOldPropertyRemoved: true });
    if (!debug.isEnabled()) chrome.tabs.remove(sender.tab.id);
  },
};

chrome.runtime.onMessage.addListener((message, sender) => {
  eventHandlers[message.event]({ message, sender });
});
