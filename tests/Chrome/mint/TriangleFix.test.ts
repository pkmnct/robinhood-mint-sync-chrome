import { logging } from "selenium-webdriver";
import { driver, enableDebugMode } from "../Setup";

// We need debug mode enabled to check the console output
beforeAll(enableDebugMode);

test("The Mint triangle fix script initializes", async () => {
  await driver.get(`https://mint.intuit.com/overview.event`);

  const logs = await driver.manage().logs().get(logging.Type.BROWSER);

  let foundInitializedMessage = false;

  logs.forEach((entry) => {
    if (entry.message.includes("[Content](Mint - Triangle Fix)") && entry.message.includes("initialized")) {
      foundInitializedMessage = true;
    }
  });

  expect(foundInitializedMessage).toBe(true);
});
