// Wait a few seconds to start the sync, otherwise it will start before the login happens.
setTimeout(function() {
    chrome.runtime.sendMessage({"triggerEvent": "mint-opened"});
    if (window.location.href.indexOf("forceRobinhoodSync=true") !== -1) {
        doAlert({"status": "Syncing Mint with Robinhood.", "persistant": true});
        chrome.runtime.sendMessage({"triggerEvent": "forceSync"});
    }
}, 2000);

function doAlert(request) {

    const targetText = request.newTab ? `" target="_blank"` : "";

    const linkText = request.link ? (`<a href="` + request.link + targetText + `" class="notification-action-link">` + request.linkText + `</a>`) : "";

    const renderedText = `
        <div class="notification-wrapper">
            <div class="notification-left">
                <img class="notification-image" src="` + chrome.extension.getURL("/images/icon128.png") + `">
            </div>
            <div class="notification-right">
                <h5 class="notification-title">Robinhood Mint Sync for Chrome</h5>
                <p>` + request.status + `</p>
                <p class="notification-action">` + linkText + `</p>
            </div>
        </div>`;

    new Noty({
        text: renderedText,
        timeout: request.persistant ? false : 15000,
        progressBar: true,
        closeWith: ['button'],
    }).show();
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (window.location.href.indexOf("forceRobinhoodSync=true") !== -1) {
        if (request.status == "Sync performed in the last hour. Not syncing.") {
            return;
        }
        if (request.shouldReload == true) {
            location.reload();
        }
    }
    doAlert(request);

    console.log(request.status);
});
