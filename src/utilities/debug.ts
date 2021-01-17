export class Debug {
  private prefix: string;
  private isDebug = false;

  constructor(type: "background" | "content", name: string) {
    const extensionPrefix = "Robinhood Mint Sync";
    const typePrefix =
      type === "background"
        ? "[Background]"
        : type === "content"
        ? "[Content]"
        : "";

    const namePrefix = `(${name})`;

    this.prefix = `${extensionPrefix} - ${typePrefix}${namePrefix} `;

    chrome.storage.sync.get("debug", ({ debug }) => {
      if (debug) {
        this.isDebug = true;
        this.log("initialized");
      }
    });
  }

  public log = (message: string): void => {
    if (this.isDebug) console.log(`${this.prefix}${message}`);
  };

  public isEnabled = (): boolean => this.isDebug;
}
