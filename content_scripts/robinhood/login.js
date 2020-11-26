// Check every .5 seconds to see if the user has completed login.
const checkIfLoggedInInterval = setInterval(checkIfLoggedIn, 500);

/**
 * Function to check if the page has been logged in yet
 */
const checkIfLoggedIn = () => {
    if (!document.location.pathname.includes("/login")) {
        chrome.runtime.sendMessage({
            event: "login-complete"
        });
        clearInterval(checkIfLoggedInInterval);
    }
}
