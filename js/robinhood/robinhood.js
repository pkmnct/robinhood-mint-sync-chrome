displayOverlay("Syncing Mint and Robinhood...", "This window will automatically close when the sync is complete");
$(document).ready(function() {
    function sendPortfolioValue() {
        var portfolioAmountElement = document.querySelector(".main-container svg text").textContent;
        if (portfolioAmountElement.includes("$")) {
            var portfolioAmount = portfolioAmountElement.split("$")[1];

            console.log("Sending portfolio amount: $" + portfolioAmount);

            // Send to background script
            chrome.runtime.sendMessage({"triggerEvent": "portfolioAmount", "portfolioAmount": portfolioAmount});
            window.close();
        } else {
            setTimeout(sendPortfolioValue, 100);
        }
    }
    if (jQuery("*:contains('Sign In')").length) {
        chrome.runtime.sendMessage({"triggerEvent": "robinhood-login"});
        window.close();
    } else {
        waitForElement(".main-container svg text", sendPortfolioValue);
    }
});
