import { driver, extensionId } from "./Setup";

beforeEach(async () => {
  await driver.get(`chrome-extension://${extensionId}/html/settings.html`);
});

test("The Settings page loads", async () => {
  const title = await driver.getTitle();
  expect(title).toBe("Robinhood Mint Sync - Settings");
});

test("Able to turn on changelog on update", async () => {
  // Check that it is disabled by default
  let isEnabled = await driver.executeScript(() => {
    return (document.querySelector("#setting-changelogOnUpdate") as HTMLInputElement).checked;
  });
  expect(isEnabled).toBe(false);

  // Enable
  await driver.executeScript(() => {
    (document.querySelector("#setting-changelogOnUpdate") as HTMLInputElement).click();
  });

  // Wait a little for the setting to save
  await driver.manage().setTimeouts({ implicit: 3000 });

  // Reload
  await driver.navigate().refresh();

  // Check that it was enabled correctly
  isEnabled = await driver.executeScript(() => {
    return (document.querySelector("#setting-changelogOnUpdate") as HTMLInputElement).checked;
  });
  expect(isEnabled).toBe(true);
});

test("Able to turn off triangle fix", async () => {
  // Check that it is enabled by default
  let isEnabled = await driver.executeScript(() => {
    return (document.querySelector("#setting-fixTriangle") as HTMLInputElement).checked;
  });
  expect(isEnabled).toBe(true);

  // Disable
  await driver.executeScript(() => {
    (document.querySelector("#setting-fixTriangle") as HTMLInputElement).click();
  });

  // Wait a little for the setting to save
  await driver.manage().setTimeouts({ implicit: 3000 });

  // Reload
  await driver.navigate().refresh();

  // Check that it was disabled correctly
  isEnabled = await driver.executeScript(() => {
    return (document.querySelector("#setting-fixTriangle") as HTMLInputElement).checked;
  });
  expect(isEnabled).toBe(false);
});

test("Able to turn on debug mode", async () => {
  // Check that it is disabled by default
  let isEnabled = await driver.executeScript(() => {
    return (document.querySelector("#setting-debugMode") as HTMLInputElement).checked;
  });
  expect(isEnabled).toBe(false);

  // Enable
  await driver.executeScript(() => {
    (document.querySelector("#setting-debugMode") as HTMLInputElement).click();
  });

  // Wait a little for the setting to save
  await driver.manage().setTimeouts({ implicit: 3000 });

  // Reload
  await driver.navigate().refresh();

  // Check that it was enabled correctly
  isEnabled = await driver.executeScript(() => {
    return (document.querySelector("#setting-debugMode") as HTMLInputElement).checked;
  });
  expect(isEnabled).toBe(true);
});

test("Able to manually trigger initial setup", async () => {
  const originalWindow = await driver.getWindowHandle();
  // Click the button
  await driver.executeScript(() => {
    (document.querySelector(".button") as HTMLInputElement).click();
  });

  // Wait for the new window or tab
  await driver.wait(async () => (await driver.getAllWindowHandles()).length === 2, 10000);

  // Loop through until we find a new window handle
  const windows = await driver.getAllWindowHandles();

  for (const handle of windows) {
    if (handle !== originalWindow) {
      await driver.switchTo().window(handle);
    }
  }

  // Get the title of the current page
  const title = await driver.getTitle();

  // Expect the sync page to open
  expect(title).toContain("Mint.com");

  const overlay = await driver.executeScript(() => {
    return (document.querySelector("#robinhood-mint-sync-overlay") as HTMLInputElement).innerText;
  });

  expect(overlay).toContain("Performing Initial Setup");
});
