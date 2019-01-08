// First Add
// https://mint.intuit.com/addprovider.event?addRobinhood=true
displayOverlay("Adding Robinhood property to Mint...", "This window will automatically close when complete.");

$(document).ready(function() {
    waitForElement("#addProperty", function() {
        var accountTotal = "0.00";
        $("#addProperty").click();

        waitForElement("#addOther", function() {
            $("#addOther").click();

            waitForElement(".propertyType", function() {
                // Choose the option 'Collectible'
                jQuery(".propertyType").val(jQuery(".propertyType option:contains(Collectible)").val());

                waitForElement("button:contains(Next)", function() {
                    jQuery("button:contains(Next)").click();

                    waitForElement("#propertyName", function() {
                        jQuery("#propertyName").val("Robinhood Account")
                        jQuery("#propertyValue").val(accountTotal);

                        waitForElement(".addProperty", function() {
                            jQuery(".addProperty").click();

                            waitForElement(".AddPropertySuccessView", function() {
                                chrome.runtime.sendMessage({"triggerEvent": "addRobinhoodComplete"});
                                window.location = "https://mint.intuit.com/overview.event";
                            });
                        });
                    });
                });
            });
        });
    });
});
