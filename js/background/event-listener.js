// Default to old time
var oldTime = new Date('1970-01-01Z00:00:00:000');
var mintTab;
var syncStartTime;

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        var currentTime = new Date();
        if (request.triggerEvent == "mint-opened") {
            chrome.storage.sync.get('mintLastSynced', function(result) {
                mintTab = sender.tab.id;
                var mintLastSynced;
                if (typeof(result.mintLastSynced) === 'undefined') {
                    // First Run
                    console.log("First run detected");
                    ga('send', 'event', 'First Run', 'Prompted Setup');
                    chrome.tabs.sendMessage(mintTab, {"status": "Robinhood account is not set up in Mint", "persistant": true, "link": "https://mint.intuit.com/addprovider.event?addRobinhood=true", "linkText": "Set up"});
                } else {
                    mintLastSynced = new Date(result.mintLastSynced);
                    var differenceMilliseconds = currentTime - mintLastSynced;
                    var differenceHours = Math.floor((differenceMilliseconds % 86400000) / 3600000);
                    if (differenceHours >= 1) {
                        console.log("Syncing Mint with Robinhood.");
                        syncStartTime = new Date();
                        ga('send', 'event', 'Sync', 'Started');

                        chrome.tabs.sendMessage(mintTab, {"status": "Syncing Mint with Robinhood.", "persistant": true});

                        // First we need to get the value of the Robinhood portfolio
                        chrome.tabs.create({url: "https://robinhood.com/account?mintRobinhood=true", active: false, openerTabId: mintTab});

                    } else {
                        console.log("Mint has synced with Robinhood within the last hour.");
                        chrome.tabs.sendMessage(mintTab, {"status": "Sync performed in the last hour. Not syncing.", "persistant": false});
                    }
                }
            });
        } else if (request.triggerEvent == "portfolioAmount") {
            console.log("Got Robinhood Portfolio Amount: $" + request.portfolioAmount);
            ga('send', 'event', 'Sync', 'Got Portfolio Amount');

            // Now we need to pass this amount to Mint to add
            chrome.tabs.create({url: "https://mint.intuit.com/settings.event?filter=property&addRobinhood=true&portfolioAmount=" + request.portfolioAmount, active: false, openerTabId: mintTab});

        } else if (request.triggerEvent == "syncComplete") {

            // Mark sync complete date
            console.log("Sync completed at " + currentTime);

            var timeToComplete = syncStartTime - currentTime;

            ga('send', 'event', 'Sync', 'Complete', timeToComplete);
            chrome.storage.sync.set({"mintLastSynced": currentTime.toString()});

            chrome.tabs.sendMessage(mintTab, {"status": "Sync Complete! Reload to see the change.", "link": "/overview.event", "linkText": "Reload", "persistant": true});

        } else if (request.triggerEvent == "addRobinhoodComplete") {
            ga('send', 'event', 'First Run', 'Complete');
            console.log("Setup Complete.");
            chrome.storage.sync.set({"mintLastSynced": oldTime.toString()});
        }
    }
);
