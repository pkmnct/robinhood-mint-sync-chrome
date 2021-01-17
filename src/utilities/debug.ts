export class Debug {
  private prefix: string;
  private isDebug = false;

  constructor(type: "background" | "content" | "internal", name: string) {
    const extensionPrefix = "Robinhood Mint Sync";
    const typePrefix =
      type === "background"
        ? "[Background]"
        : type === "content"
        ? "[Content]"
        : type === "internal"
        ? "[Internal]"
        : "";

    const namePrefix = `(${name})`;

    this.prefix = `${
      type === "content" ? extensionPrefix + " - " : ""
    }${typePrefix}${namePrefix}`;

    chrome.storage.sync.get("debugMode", ({ debugMode }) => {
      if (debugMode) {
        this.isDebug = true;
        this.log("initialized");
      }
    });
  }

  public log = (...params: any[]): void => {
    const newParams = [...params];
    newParams.unshift(this.prefix);
    if (this.isDebug) console.log(...newParams);
  };

  public isEnabled = (): boolean => this.isDebug;
}
