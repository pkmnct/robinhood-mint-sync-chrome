import { Builder, ThenableWebDriver } from "selenium-webdriver";
import * as chrome from "selenium-webdriver/chrome";

export let driver: ThenableWebDriver;
export const extensionId = "nafbjkapffjmimgakdpphielakefjfme";

beforeAll(async () => {
  const options = new chrome.Options();
  options.addArguments("load-extension=dist/extension");

  driver = new Builder().forBrowser("chrome").setChromeOptions(options).build();

  // Get a reference to the window the tests will run in
  const testWindow = await driver.getWindowHandle();

  // Wait for the Welcome window to open
  await driver.wait(async () => (await driver.getAllWindowHandles()).length === 2, 10000);

  // Find and close the welcome window
  const windows = await driver.getAllWindowHandles();

  for (const handle of windows) {
    if (handle !== testWindow) {
      await driver.switchTo().window(handle);
      await driver.close();
      await driver.switchTo().window(testWindow);
    }
  }
});

afterAll(async () => {
  await driver.quit();
});
