var loginCheckInterval = setInterval(function() { checkIfLoggedIn(); }, 1000);

function checkIfLoggedIn() {
    if (document.title.indexOf("Log In") !== -1) {
        console.log("Not yet logged in...");
    } else {
        chrome.runtime.sendMessage({"triggerEvent": "robinhood-logged-in"});
        clearInterval(loginCheckInterval);
    }
}
