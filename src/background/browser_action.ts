chrome.browserAction.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: chrome.extension.getURL("html/welcome.html"),
    active: true,
    openerTabId: tab.id,
  });
});
