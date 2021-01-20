export const urls = {
  robinhood: {
    login: "https://robinhood.com/login?redirectMint=true",
    scrape: "https://robinhood.com/account?syncMint=true",
    api: "https://phoenix.robinhood.com/accounts/unified",
  },
  mint: {
    overview: "https://mint.intuit.com/overview.event",
    forceSync: "https://mint.intuit.com/overview.event?forceRobinhoodSync=true",
    properties: {
      update: "https://mint.intuit.com/settings.event?filter=property&addRobinhood=true",
      check: "https://mint.intuit.com/settings.event?filter=property&setupRobinhood=true",
      create: "https://mint.intuit.com/settings.event?filter=property&createProperty=true",
    },
  },
  extension: {
    changelog: "https://pkmnct.github.io/robinhood-mint-sync-chrome/changelog.html",
  },
};
