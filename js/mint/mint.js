chrome.storage.sync.get({"fixTriangle": true}, function(result) {
    if (result.fixTriangle) {
        $(`
<style>
.rhmsc-fix-triangle .disclosure-triangle {
    transform: rotate(0deg);
}
</style>
`)
    }
});
