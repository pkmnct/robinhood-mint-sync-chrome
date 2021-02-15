import { logging } from "selenium-webdriver";
import { driver, enableDebugMode } from "../Setup";

// We need debug mode enabled to check the console output
beforeAll(enableDebugMode);

test("The login script initializes after the Robinhood page loads", async () => {
  await driver.get(`https://robinhood.com/login?redirectMint=true`);

  const logs = await driver.manage().logs().get(logging.Type.BROWSER);

  let foundInitializedMessage = false;

  logs.forEach((entry) => {
    if (entry.message.includes("[Content](Robinhood - Login)") && entry.message.includes("initialized")) {
      foundInitializedMessage = true;
    }
  });

  expect(foundInitializedMessage).toBe(true);
});
