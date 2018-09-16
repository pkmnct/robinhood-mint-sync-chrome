chrome.runtime.sendMessage({"triggerEvent": "mint-opened"});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    var link = "";

    if (typeof(request.link) !== "undefined") {
        link = "<a href='" + request.link + "'>" + request.linkText + "</a>";
    }

    var syncLogo = "<img src='" + chrome.extension.getURL("/images/icon128.png") + "'>";

    var alertElement = $("<div id='mintRobinhoodSyncStatus'><div class='title'>Robinhood Mint Sync</div>" + syncLogo + request.status + link + "</div>").appendTo("body");

    if (typeof(request.persistant) !== "undefined") {
        if (request.persistant == false) {
            setTimeout(function() {
                alertElement.addClass("fadeOut");
                setTimeout(function() {
                    alertElement.remove();
                }, 1500);
            }, 8000);
        }
    }

    console.log(request.status);
});
