import { logging } from "selenium-webdriver";
import { driver, enableDebugMode } from "../../Setup";

// We need debug mode enabled to check the console output
beforeAll(enableDebugMode);

beforeEach(async () => {
  await driver.get(`https://mint.intuit.com/settings.event?filter=property&addRobinhood=true`);
});

test("The Mint property update script initializes", async () => {
  const logs = await driver.manage().logs().get(logging.Type.BROWSER);

  let foundInitializedMessage = false;

  logs.forEach((entry) => {
    if (entry.message.includes("[Content](Mint - Properties - Update)") && entry.message.includes("initialized")) {
      foundInitializedMessage = true;
    }
  });

  expect(foundInitializedMessage).toBe(true);
});

test("The page displays an overlay", async () => {
  const overlay = await driver.executeScript(() => {
    return (document.querySelector("#robinhood-mint-sync-overlay") as HTMLInputElement).innerText;
  });

  expect(overlay).toContain("Updating Mint Properties");
});