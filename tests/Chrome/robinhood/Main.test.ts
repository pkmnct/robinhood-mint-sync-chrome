import { logging } from "selenium-webdriver";
import { driver, enableDebugMode } from "../Setup";

// We need debug mode enabled to check the console output
beforeAll(enableDebugMode);

test("The Robinhood scrape script initializes", async () => {
  await driver.get(`https://robinhood.com/account?syncMint=true`);

  const logs = await driver.manage().logs().get(logging.Type.BROWSER);

  let foundInitializedMessage = false;

  logs.forEach((entry) => {
    if (entry.message.includes("[Content](Robinhood - Main)") && entry.message.includes("initialized")) {
      foundInitializedMessage = true;
    }
  });

  expect(foundInitializedMessage).toBe(true);
});

test("The Robinhood scrape page displays an overlay", async () => {
  const overlay = await driver.executeScript(() => {
    return (document.querySelector("#robinhood-mint-sync-overlay") as HTMLInputElement).innerText;
  });

  expect(overlay).toContain("Getting data from Robinhood");
});
