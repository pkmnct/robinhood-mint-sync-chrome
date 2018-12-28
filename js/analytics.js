(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

chrome.storage.sync.get({"disableAnalytics": false}, function(result) {
    if (result.disableAnalytics == false) {
        console.log("Analytics are enabled.");
        sendAnalytics();
    } else {
        console.log("Analytics are disabled.");
        ga = function() {
            console.log("Analytics are disabled.");
        }
    }
})

function sendAnalytics() {
  if (typeof ga !== "undefined") {
    console.log("Analytics loaded.");
    var screenName = "";

    if (document.title) {
        screenName = document.title;
    }

    ga('create', 'UA-118042537-2', 'auto');
    ga('set', 'checkProtocolTask', function(){});
    ga('send', 'screenview', {
        'appName': 'Robinhood Mint Sync',
        'screenName': screenName,
        'appVersion': chrome.runtime.getManifest().version
    });
  } else {
    setTimeout(function() {
      sendAnalytics();
      console.log("Google Analytics not yet loaded.");
    }, 500);
  }
}
