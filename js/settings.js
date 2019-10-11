chrome.storage.sync.get({"changelogOnUpdate": true, "disableAnalytics": false, "fixTriangle": true}, function(result) {
    console.log(result);
    if (result.changelogOnUpdate) {
        $("#setting-changelogOnUpdate").prop("checked", true);
    }
    if (result.disableAnalytics) {
        $("#setting-disableAnalytics").prop("checked", true);
    }
    if (result.fixTriangle) {
        $("#setting-fixTriangle").prop("checked", true);
    }
    $("#setting-changelogOnUpdate").change(function() {
        chrome.storage.sync.set({"changelogOnUpdate":  $("#setting-changelogOnUpdate").is(':checked')});
    });
    $("#setting-disableAnalytics").change(function() {
        console.log("change");
        console.log($("#setting-disableAnalytics").is(':checked'));
        chrome.storage.sync.set({"disableAnalytics":  $("#setting-disableAnalytics").is(':checked')});
    });
    $("#setting-fixTriangle").change(function() {
        chrome.storage.sync.set({"fixTriangle":  $("#setting-fixTriangle").is(':checked')});
    });
});
