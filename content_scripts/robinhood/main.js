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
            reject(new Error("Failed to get reduxPersist:auth"));
        }
    };
    database.onerror = (e) => {
        reject(new Error("Failed to open database"));
    }
});

/**
 * Function to scrape the portfolio and cash values
 */
const scrapeData = async () => {
    const returnValue = {
        event: "portfolio_balance",
    }

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

        returnValue.debug = json;

        if (json && json.uninvested_cash && json.uninvested_cash.amount) {
            returnValue.uninvested_cash = json.uninvested_cash.amount;
        }

        if (json && json.total_market_value && json.total_market_value.amount) {
            returnValue.total_market_value = json.total_market_value.amount;
        }
        
        return returnValue;
    } catch (error) {
        returnValue.error = true;
        return returnValue;
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
            const data = await scrapeData();
            chrome.runtime.sendMessage(data);
            window.close();
        }
    })
}

init();