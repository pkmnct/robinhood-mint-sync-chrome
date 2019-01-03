chrome.runtime.onInstalled.addListener(function(details) {
    // When the extension is installed
    if (details.reason == "install") {
        // Open the welcome page
        window.open(chrome.extension.getURL("/html/welcome.html"), '_blank');

    // When the extension is updated
    } else if (details.reason == "update") {
        // Information about the previous versionCompare
        var previousVersion = details.previousVersion;

        // If the changelogOnUpdate setting is set (default=true), open the changelog on updates
        chrome.storage.sync.get({changelogOnUpdate: true} , function(result) {
            if (result.changelogOnUpdate) {
                window.open(chrome.extension.getURL("/html/changelog.html"), '_blank');
            }
        });
    }
});
