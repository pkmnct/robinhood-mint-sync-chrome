chrome.browserAction.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: chrome.extension.getURL("/pages/welcome/"),
    active: true,
    openerTabId: tab.id,
  });
});
