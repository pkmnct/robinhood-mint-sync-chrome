import { Builder, ThenableWebDriver } from "selenium-webdriver";
import * as chrome from "selenium-webdriver/chrome";

export let driver: ThenableWebDriver;
export const extensionId = "nafbjkapffjmimgakdpphielakefjfme";

beforeAll(async () => {
  const options = new chrome.Options();
  options.addArguments("load-extension=dist/extension");
  options.setLoggingPrefs({
    browser: "ALL",
  });

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

export const enableDebugMode = async (): Promise<void> => {
  await driver.get(`chrome-extension://${extensionId}/html/settings.html`);

  const isEnabled = await driver.executeScript(() => {
    return (document.querySelector("#setting-debugMode") as HTMLInputElement).checked;
  });

  if (!isEnabled) {
    // Enable debug mode
    await driver.executeScript(() => {
      (document.querySelector("#setting-debugMode") as HTMLInputElement).click();
    });

    // Wait a little for the setting to save
    await driver.manage().setTimeouts({ implicit: 3000 });
  }
};

// Sometimes selenium is slow
jest.setTimeout(30000);
