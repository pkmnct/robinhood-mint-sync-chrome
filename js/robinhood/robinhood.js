displayOverlay();
$(document).ready(function() {
    function sendPortfolioValue() {
        if (jQuery(jQuery("h1")[1]).text().length && !(jQuery(jQuery("h1")[1]).text().startsWith("$0.00"))) {
            var portfolioAmount = jQuery(jQuery("h1")[1]).text().split("9876543210-$,.")[0]

            console.log("Sending portfolio amount: $" + portfolioAmount);

            // Send to background script
            chrome.runtime.sendMessage({"triggerEvent": "portfolioAmount", "portfolioAmount": portfolioAmount});
            window.close();
        } else {
            setTimeout(sendPortfolioValue, 100);
        }
    }
    sendPortfolioValue();
});
