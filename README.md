<img src="https://raw.githubusercontent.com/pkmnct/robinhood-mint-sync-chrome/master/public/images/icon512.png" alt="Mint and Robinhood Sync Icon" width="128" height="128">

# Robinhood Mint Sync for Chrome

A Chrome Extension that allows you to automatically sync your Robinhood portfolio balance with your Mint account. It will add the balance as a _collectible_ in Mint.

[View the project site](https://pkmnct.github.io/robinhood-mint-sync-chrome/)

## Installation

#### General Use

The extension is offered through the [Chrome Web Store](https://chrome.google.com/webstore/detail/robinhood-mint-integratio/mogflmdandlpjobbddhopcggkjoggpdo):

[<img src="https://raw.githubusercontent.com/pkmnct/robinhood-mint-sync-chrome/master/images/chrome-web-store.png" alt="Available in the Chrome Web Store" width="248" height="75">](https://chrome.google.com/webstore/detail/robinhood-mint-integratio/mogflmdandlpjobbddhopcggkjoggpdo)

#### Developer Use

You can also run a local version of the extension for development.

1. Download or clone the repository.
2. Install dependencies: `npm i` in the repository.
3. Build the files: `npm run watch` in the repository.
4. Open the Chrome Extensions Page (Chrome Menu > More Tools > Extensions).
5. Turn on the Developer Mode switch on the top-right of the page.
6. Choose the _Load unpacked_ button and navigate to the `dist/extension` folder of the repository.

## How to use the Extension

The extension is very simple to use. Just visit your [Mint overview page](https://mint.intuit.com/overview.event) to automatically initiate a sync. If you have not performed a sync before, you will be directed to set up the item in Mint to track your Robinhood portfolio to.

## Note on Mint's native Robinhood support

Mint previously introduced native support for Robinhood shortly after this extension was released, however [Mint is reporting that Robinhood is blocking their app](https://help.mint.com/Featured-Questions/2090847861/Known-Issue-Robinhood-Error-102-105-155.htm). While the extension had previously been deprecated, it is now back under active development. This extension will add the Robinhood balance as _collectibles_ in Mint. If you had previously added your account natively, you should mark the account as inactive to prevent duplication of balances.
