// First Add
// https://mint.intuit.com/addprovider.event

displayOverlay("Adding Robinhood property to Mint...", "This window will automatically close when complete.");

$(document).ready(function() {
    function setupRobinhoodProperty() {
        if (jQuery("#addProperty").length) {
            console.log("Adding Mint Property...");
            var accountTotal = "0.00";

            jQuery("#addProperty").click();
            jQuery("#addOther").click();

            setTimeout(function() {
                jQuery(".propertyType").val(jQuery(".propertyType option:contains(Collectible)").val());
                jQuery("button:contains(Next)").click();
                setTimeout(function() {
                    jQuery("#propertyName").val("Robinhood Account")
                    jQuery("#propertyValue").val(accountTotal);
                    setTimeout(function() {
                        jQuery(".addProperty").click();
                        finishSetup();
                    }, 10000);
                }, 10000);
            }, 10000);
        } else {
            setTimeout(setupRobinhoodProperty, 50);
        }
    }
    setupRobinhoodProperty();

    function finishSetup() {
        if ($(".AddPropertySuccessView").length) {
            chrome.runtime.sendMessage({"triggerEvent": "addRobinhoodComplete"});
            window.location = "https://mint.intuit.com/overview.event";
        } else {
            setTimeout(finishSetup, 50);
        }
    }
})
