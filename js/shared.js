function displayOverlay(header, message) {
    $("<div id='mint-robinhood-sync' style='position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.75); text-align: center; padding-top: 25vh; color: #fff; z-index: 9999999999;'><img src='" + chrome.extension.getURL("/images/icon512.png") + "' alt='Robinhood Mint Sync for Chrome' style='width: 256px;'><h1 style='font-size: 2.4em; margin: 1em 0 .5em 0;'>" + header + "</h1><h4 style='font-size: 1.4em;'>" + message + "</h4></div>").appendTo("body");
}

// Function that will wait until an element exists, then run a callback
function waitForElement(selector, callback) {
    if ($(selector).length) {
        setTimeout(function() {
            callback();
        }, 100);
    } else {
        setTimeout(function() {
            waitForElement(selector, callback);
        }, 100);
    }
}
