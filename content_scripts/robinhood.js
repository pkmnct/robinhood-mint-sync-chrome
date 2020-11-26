/**
 * Function to get the bearer token from the redux store on Robinhood. This will be used for the Robinhood API calls.
 */
const getBearerToken = () => new Promise((resolve, reject) => {
    let database = window.indexedDB.open("localforage");
    database.onsuccess = () => {
        let transaction = database.result.transaction("keyvaluepairs", "readwrite");
        let objectStore = transaction.objectStore("keyvaluepairs");
        let auth = objectStore.get("reduxPersist:auth");

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
 * Initialize the content script on Robinhood
 */
const init = async () => {
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
}

init();