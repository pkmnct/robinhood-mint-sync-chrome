window.addEventListener("load", () => {
  const checkIfLoggedIn = () => {
    if (document.title.includes("Portfolio")) {
      chrome.runtime.sendMessage({
        triggerEvent: "robinhood-logged-in",
      });
      clearInterval(checkIfLoggedInInterval);
    }
  };

  // Check every .5 seconds to see if the user has completed login.
  const checkIfLoggedInInterval = setInterval(checkIfLoggedIn, 500);
});
