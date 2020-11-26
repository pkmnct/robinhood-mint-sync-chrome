/**
 * Function to get the bearer token from the redux store on Robinhood. This will be used for the Robinhood API calls.
 */
const getBearerToken = () => new Promise((resolve, reject) => {
    const database = window.indexedDB.open("localforage");
    database.onsuccess = () => {
        const transaction = database.result.transaction("keyvaluepairs", "readwrite");
        const objectStore = transaction.objectStore("keyvaluepairs");
        const auth = objectStore.get("reduxPersist:auth");

        auth.onsuccess = () => {
            try {
                const access_token = JSON.parse(auth.result).split(`access_token","`)[1].split(`"`)[0];
                resolve(access_token);
            } catch (error) {
                reject(error);
            }
        }
        auth.onerror = () => {
            reject("Failed to get reduxPersist:auth");
        }
    };
    database.onerror = (e) => {
        reject("Failed to open database");
    }
});

/**
 * Function to scrape the portfolio and cash values
 */
const scrapeData = async () => {
    try {
        const access_token = await getBearerToken();
        const api_url = "https://phoenix.robinhood.com/accounts/unified";

        const response = await fetch(api_url, {
            method: "GET",
            headers: new Headers({
                'authorization': `Bearer ${access_token}`
            })
        });
        
        const json = await response.json();

        const cashValue = json.uninvested_cash.amount;
        const marketValue = json.total_market_value.amount;
        chrome.runtime.sendMessage({
            event: "portfolio_balance",
            cash: cashValue,
            market: marketValue,
            error: false
        });
    } catch (error) {
        chrome.runtime.sendMessage({
            event: "portfolio_balance",
            error: true
        });
    }
}

/**
 * Initialize the content script on Robinhood
 */
const init = () => {
    window.addEventListener("load", () => {
        if (document.location.pathname === "/login") {
            chrome.runtime.sendMessage({
                event: "login-needed"
            });
            window.close();
        } else {
            await scrapeData();
            window.close();
        }
    })
}

init();