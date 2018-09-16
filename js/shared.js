function displayOverlay() {
    $("<div id='mint-robinhood-sync' style='position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.75); text-align: center; padding-top: 25vh; color: #fff; z-index: 9999999999;'><h1>Syncing Mint and Robinhood...</h1><h4>This window will automatically close when the sync is complete</h4></div>").appendTo("body");
}
