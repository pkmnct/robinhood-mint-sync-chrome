import { driver, extensionId } from "./Setup";

test("The Licenses page loads", async () => {
  await driver.get(`chrome-extension://${extensionId}/html/licenses.html`);
  const title = await driver.getTitle();
  expect(title).toBe("Robinhood Mint Sync - Licenses");
});
