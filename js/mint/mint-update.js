// Update
// https://mint.intuit.com/settings.event?filter=property

displayOverlay("Syncing Mint and Robinhood...","This window will automatically close when the sync is complete");

var urlParams = new URLSearchParams(window.location.search);

$(document).ready(function() {
    function setRobinhoodAmount() {
        if (jQuery(".OtherPropertyView:contains(Robinhood Account)").length) {
            console.log("Robinhood Mint Integration - Updating Robinhood Portfolio Value");
            var accountTotal = urlParams.get("portfolioAmount");

            var robinhoodContainer = jQuery(".OtherPropertyView:contains(Robinhood Account)");
            robinhoodContainer.find("span:contains(Robinhood Account)").click();

            var robinhoodInputs = robinhoodContainer.find("input");

            if (jQuery(robinhoodInputs[0]).val() == "Robinhood Account") {
                jQuery(robinhoodInputs[1]).val(accountTotal);
                jQuery("<script>jQuery('.saveButton').attr('disabled',false).click();</script>").appendTo("body");
                closeWindow(robinhoodContainer);
            }
        } else {
            setTimeout(setRobinhoodAmount, 50);
        }
    }

    function closeWindow() {
        if ($(".AccountView.open").length) {
            setTimeout(closeWindow, 50);
        } else {
            chrome.runtime.sendMessage({"triggerEvent": "syncComplete"});
            window.close();
        }
    }
    setRobinhoodAmount();
});
