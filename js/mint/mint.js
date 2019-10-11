chrome.storage.sync.get({"fixTriangle": true}, function(result) {
    if (result.fixTriangle) {
        $("body").addClass("rhmsc-fix-triangle");
    }
});
