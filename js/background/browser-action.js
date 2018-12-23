chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.create({url: chrome.extension.getURL("/html/welcome.html"), active: true, openerTabId: tab.id}, function(result) {
        console.log(result);
    });
})
