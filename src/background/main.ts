import { URLS } from "../constants/urls";
import { Message } from "../constants/interfaces";
import { Debug } from "../utilities/debug";
import { sanitizeInput } from "../utilities/sanitizeInput";
const debug = new Debug("background", "Main");

// Need to be able to access this regardless of the message.
let mintTab: undefined | number;
let newProperties = 0;
let newPropertiesComplete = 0;

// The key of the handler should match the message.event value
const eventHandlers: {
  [key: string]: (options?: { message: Message; sender: chrome.runtime.MessageSender }) => void;
} = {
  "trigger-sync": () => {
    // Send notification
    chrome.tabs.sendMessage(mintTab, {
      status: "Syncing Mint with Robinhood.",
      persistent: true,
    });

    // Trigger the sync
    chrome.tabs.create({
      url: URLS.robinhood.scrape,
      active: false,
    });
  },
  "trigger-sync-no-message": ({ sender }) => {
    // Trigger the sync
    chrome.tabs.create({
      url: URLS.robinhood.scrape,
      active: false,
    });
    if (!debug.isEnabled()) chrome.tabs.remove(sender.tab.id);
  },
  // This event is emitted by the main Robinhood content script.
  "robinhood-login-needed": ({ sender }) => {
    chrome.tabs.sendMessage(mintTab, {
      status: "You need to log in to Robinhood",
      link: URLS.robinhood.login,
      linkText: "Login",
      persistent: true,
      newTab: true,
    });
    if (!debug.isEnabled()) chrome.tabs.remove(sender.tab.id);
  },
  // This event is emitted by the login Robinhood content script.
  "robinhood-login-success": ({ sender }) => {
    // Close the Robinhood tab logged in from
    if (!debug.isEnabled()) chrome.tabs.remove(sender.tab.id);

    eventHandlers["trigger-sync"]();

    // Switch focus back to Mint
    chrome.tabs.update(mintTab, {
      selected: true,
    });
  },
  // This event is emitted by the main Robinhood content script.
  "robinhood-portfolio-scraped": ({ sender, message }) => {
    if (message.error) {
      debug.error(message.error);
      chrome.tabs.sendMessage(mintTab, {
        status: "Error getting your portfolio from Robinhood. Please reload and try to sync again.",
        link: "/overview.event",
        linkText: "Reload",
        persistent: true,
      });
    } else {
      // Trigger the Mint portfolio update content script
      chrome.tabs.create(
        {
          url: URLS.mint.properties.update,
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
    }
    if (!debug.isEnabled()) chrome.tabs.remove(sender.tab.id);
  },
  // This event is emitted by the Mint property create content script.
  "mint-property-added": ({ sender }) => {
    newPropertiesComplete++;
    if (!debug.isEnabled()) chrome.tabs.remove(sender.tab.id);

    debug.log(`Setup ${newPropertiesComplete} of ${newProperties} properties.`);
    if (newPropertiesComplete === newProperties) {
      newPropertiesComplete = 0;
      eventHandlers["setup-complete"]();
    }
  },
  // This event is emitted by the mint-property-added and/or the mint-property-setup-complete event handlers
  "setup-complete": () => {
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
  "mint-property-setup-complete": ({ sender, message }) => {
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
  "mint-sync-complete": ({ message, sender }) => {
    debug.log("mint-sync-complete event");
    chrome.storage.sync.set({ syncTime: new Date().toISOString() });
    let account = "";
    if (message.accountName) {
      account = sanitizeInput(message.accountName);
    }
    chrome.tabs.sendMessage(mintTab, {
      status: `Sync Complete! ${account ? "Synced with account " + account + ". " : ""}Reload to see the change.`,
      link: "/overview.event",
      linkText: "Reload",
      persistent: true,
    });
    if (!debug.isEnabled()) chrome.tabs.remove(sender.tab.id);
  },
  // This event is emitted by the main Mint content script
  "mint-opened": ({ sender, message }) => {
    const { forceUpdate } = message;
    // Store a reference to the mint tab to be able to show the notifications
    mintTab = sender.tab.id;

    chrome.storage.sync.get(
      ["syncTime", "propertiesSetup", "needsOldPropertyRemoved", "updated"],
      ({ syncTime, propertiesSetup, needsOldPropertyRemoved, updated }) => {
        if (updated) {
          chrome.tabs.sendMessage(mintTab, {
            status: "Robinhood Mint Sync has updated.",
            persistent: true,
            link: URLS.extension.changelog,
            linkText: "View Changelog",
            newTab: true,
          });
          // TODO: only dismiss changelog after it's been viewed?
          chrome.storage.sync.set({ updated: false });
        }
        if (needsOldPropertyRemoved) {
          chrome.tabs.create({
            url: URLS.mint.properties.check,
            active: false,
          });
        } else if (!propertiesSetup || !syncTime) {
          // Sync has not been set up
          chrome.tabs.sendMessage(mintTab, {
            status: "You have not yet performed a sync on this device. You must run an initial setup.",
            persistent: false,
            link: URLS.mint.properties.check,
            linkText: "Set up",
            newTab: true,
          });
        } else {
          const syncTimeParsed = new Date(syncTime);
          const currentTime = new Date();
          const differenceMilliseconds = currentTime.valueOf() - syncTimeParsed.valueOf();
          const differenceHours = Math.floor((differenceMilliseconds % 86400000) / 3600000);
          debug.log(syncTime, syncTimeParsed, currentTime, differenceHours);
          if (differenceHours >= 1 || forceUpdate) {
            eventHandlers["trigger-sync"]();
          } else {
            chrome.tabs.sendMessage(mintTab, {
              status: "Sync performed in the last hour. Not syncing.",
              link: URLS.mint.forceSync,
              linkText: "Sync",
              persistent: false,
            });
          }
        }
      }
    );
  },
  // This event tells us to open a new check content page
  "mint-mutliple-account-trigger-setup": ({ sender, message }) => {
    chrome.tabs.sendMessage(mintTab, {
      status: `New Account Detected: "${sanitizeInput(message.accountName)}". Creating new properties.`,
    });
    chrome.tabs.create({
      url: URLS.mint.properties.check,
      active: false,
    });
    if (!debug.isEnabled()) chrome.tabs.remove(sender.tab.id);
  },
  // This event is emitted by the Mint property check content script.
  "mint-create": ({ message }) => {
    chrome.tabs.create({
      url: URLS.mint.properties.create + "&property=" + message.property,
      active: false,
    });
  },
  // This event is emitted by the Mint property check content script.
  "mint-property-remove": ({ sender }) => {
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
  // This event is emitted by the Mint property check content script.
  "mint-property-non-multiple-remove": ({ sender }) => {
    chrome.tabs.sendMessage(mintTab, {
      status:
        "Your account appears to have data from a non multiple account setup. Please remove the old 'Robinhood Cash', 'Robinhood Stocks', 'Robinhood Crypto' & 'Robinhood Other' properties from Mint to prevent duplication of your portfolio balance. Reload the overview to sync after removing the property.",
      persistent: true,
      link: "https://mint.intuit.com/settings.event?filter=property",
      linkText: "Mint Properties",
      newTab: true,
    });
    chrome.storage.sync.set({ needsOldPropertyRemoved: true });
    if (!debug.isEnabled()) chrome.tabs.remove(sender.tab.id);
  },
  // This event is emitted by the Mint property check content script.
  "mint-property-non-single-remove": ({ sender }) => {
    chrome.tabs.sendMessage(mintTab, {
      status:
        "Your account appears to have data from a multiple account setup. Please remove the old 'Robinhood Cash - [ACCOUNT_ NAME]', 'Robinhood Stocks - [ACCOUNT_ NAME]', 'Robinhood Crypto - [ACCOUNT_ NAME]' & 'Robinhood Other - [ACCOUNT_ NAME]' properties from Mint to prevent duplication of your portfolio balance. Reload the overview to sync after removing the property.",
      persistent: true,
      link: "https://mint.intuit.com/settings.event?filter=property",
      linkText: "Mint Properties",
      newTab: true,
    });
    chrome.storage.sync.set({ needsOldPropertyRemoved: true });
    if (!debug.isEnabled()) chrome.tabs.remove(sender.tab.id);
  },
  // This event is emitted when a property is missing for the updater
  "mint-missing-property": ({ sender, message }) => {
    const property = message.property ? sanitizeInput(message.property) : "NOT FOUND";
    chrome.tabs.sendMessage(mintTab, {
      status: `The property "${property}" could not be found for updating. Set up needs to be run again to fix.`,
      persistent: true,
      link: URLS.mint.properties.check,
      linkText: "Set up",
      newTab: true,
    });
    chrome.storage.sync.set({ propertiesSetup: false });
    if (!debug.isEnabled()) chrome.tabs.remove(sender.tab.id);
  },
  // This event is emitted when a property could not be updated as a result of bad data from the scraper
  "mint-unable-to-update-property": ({ sender, message }) => {
    const property = message.property ? sanitizeInput(message.property) : "NOT FOUND";
    chrome.tabs.sendMessage(mintTab, {
      status: `The property "${property}" could not be updated.`,
    });
    if (!debug.isEnabled()) chrome.tabs.remove(sender.tab.id);
  },
};

chrome.runtime.onMessage.addListener((message: Message, sender: chrome.runtime.MessageSender) => {
  if (message && message.event && typeof eventHandlers[message.event] === "function") {
    debug.log(`${message.event} event`);
    eventHandlers[message.event]({ message, sender });
  } else {
    debug.error("Event Handler for event not found.", message);
  }
});
