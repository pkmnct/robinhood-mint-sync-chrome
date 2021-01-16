export const urls = {
  robinhood: {
    login: "https://robinhood.com/login?redirectMint=true",
    scrape: "https://robinhood.com/account?syncMint=true",
  },
  mint: {
    overview: "https://mint.intuit.com/overview.event",
    forceSync: "https://mint.intuit.com/overview.event?forceRobinhoodSync=true",
    properties: {
      update:
        "https://mint.intuit.com/settings.event?filter=property&addRobinhood=true",
      check:
        "https://mint.intuit.com/settings.event?filter=property&setupRobinhood=true",
      setup: "https://mint.intuit.com/addprovider.event?addRobinhood=true",
    },
  },
};
