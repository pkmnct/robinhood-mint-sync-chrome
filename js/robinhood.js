displayOverlay();
$(document).ready(function() {
    function sendPortfolioValue() {
        if ($(".subheading").length && !($(".subheading").text().startsWith("$0.00"))) {
            var portfolioArray = $(".subheading").text().split(".");
            var portfolioAmount = portfolioArray[0].split("$")[1].replace(/[^\d\.]/g,'') + "." + portfolioArray[1].substring(0,2);

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
