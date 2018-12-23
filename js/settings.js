chrome.storage.sync.get({"welcomeOnUpdate": true, "disableAnalytics": false}, function(result) {
    console.log(result);
    if (result.welcomeOnUpdate) {
        $("#setting-welcomeOnUpdate").prop("checked", true);
    }
    if (result.disableAnalytics) {
        $("#setting-disableAnalytics").prop("checked", true);
    }
    $("#setting-welcomeOnUpdate").change(function() {
        chrome.storage.sync.set({"welcomeOnUpdate":  $("#setting-welcomeOnUpdate").is(':checked')});
    });
    $("#setting-disableAnalytics").change(function() {
        console.log("change");
        console.log($("#setting-disableAnalytics").is(':checked'));
        chrome.storage.sync.set({"disableAnalytics":  $("#setting-disableAnalytics").is(':checked')});
    });
});
