chrome.storage.sync.get({"changelogOnUpdate": false, "fixTriangle": true}, function(result) {
    console.log(result);
    if (result.changelogOnUpdate) {
        $("#setting-changelogOnUpdate").prop("checked", true);
    }
    if (result.fixTriangle) {
        $("#setting-fixTriangle").prop("checked", true);
    }
    $("#setting-changelogOnUpdate").change(function() {
        chrome.storage.sync.set({"changelogOnUpdate":  $("#setting-changelogOnUpdate").is(':checked')});
    });
    $("#setting-fixTriangle").change(function() {
        chrome.storage.sync.set({"fixTriangle":  $("#setting-fixTriangle").is(':checked')});
    });
});
