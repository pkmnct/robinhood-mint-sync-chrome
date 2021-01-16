## Note on Mint's native Robinhood support

Support was added to Mint for Robinhood. Some users are reporting that the native support no longer works. This extension does continue to work, but it will add the Robinhood balance as a _collectible_. If you are able to successfully [add Robinhood to Mint natively](https://help.mint.com/General/888961131/How-do-I-add-a-new-account-in-Mint.htm) the balance will show up under investments. Any changes made to Robinhood or Mint in the future could break this extension.

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
6. Choose the _Load unpacked_ button and navigate to the `dist` folder of the repository.

## How to use the Extension

The extension is very simple to use. Just visit your [Mint overview page](https://mint.intuit.com/overview.event) to automatically initiate a sync. If you have not performed a sync before, you will be directed to set up the item in Mint to track your Robinhood portfolio to.
