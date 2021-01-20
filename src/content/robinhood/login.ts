import { Debug } from "../../utilities/debug";

const debug = new Debug("content", "Robinhood - Login");

const checkIfLoggedIn = () => {
  debug.log("Checking if logged in.");
  if (document.title.includes("Portfolio")) {
    debug.log("Appears to be logged in!");
    chrome.runtime.sendMessage({
      event: "robinhood-login-success",
    });
    clearInterval(checkIfLoggedInInterval);
  }
};

// Check every .5 seconds to see if the user has completed login.
const checkIfLoggedInInterval = setInterval(checkIfLoggedIn, 500);
