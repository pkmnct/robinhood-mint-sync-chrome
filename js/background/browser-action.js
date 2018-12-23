chrome.browserAction.onClicked.addListener(function(tab) {
    console.log("Syncing Mint with Robinhood.");
    syncStartTime = new Date();
    ga('send', 'event', 'Sync', 'Started');

    chrome.tabs.create({url: "https://mint.intuit.com/overview.event?forceRobinhoodSync=true", active: true, openerTabId: tab.id}, function(result) {
        console.warn(result);
        chrome.tabs.sendMessage(result.id, {"status": "Syncing Mint with Robinhood.", "persistant": true});

        // First we need to get the value of the Robinhood portfolio
        chrome.tabs.create({url: "https://robinhood.com/account?mintRobinhood=true", active: false, openerTabId: result.id});
    });;
})
