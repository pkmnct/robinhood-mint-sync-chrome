import { driver, extensionId } from "./Setup";

test("The Welcome page loads", async () => {
  await driver.get(`chrome-extension://${extensionId}/html/welcome.html`);
  const title = await driver.getTitle();
  expect(title).toBe("Robinhood Mint Sync - Welcome");
});
