export class Debug {
  private prefix: string;
  private isDebug = false;

  constructor(type: "background" | "content" | "internal", name: string) {
    const extensionPrefix = "Robinhood Mint Sync";
    const typePrefix = type === "background" ? "[Background]" : type === "content" ? "[Content]" : type === "internal" ? "[Internal]" : "";

    const namePrefix = `(${name})`;

    this.prefix = `${type === "content" ? extensionPrefix + " - " : ""}${typePrefix}${namePrefix}`;

    chrome.storage.sync.get("debugMode", ({ debugMode }) => {
      if (debugMode) {
        this.isDebug = true;
        this.log("initialized");
      }
    });
  }

  // We want to allow logging anything, like console.log does. Disabling related eslint for this line
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public log = (...params: any[]): void => {
    const newParams = [...params];
    newParams.unshift(this.prefix);
    if (this.isDebug) console.log(...newParams);
  };

  // We want to allow logging anything, like console.error does. Disabling related eslint for this line
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public error = (...params: any[]): void => {
    const newParams = [...params];
    newParams.unshift(this.prefix);
    if (this.isDebug) console.error(...newParams);
  };

  public isEnabled = (): boolean => this.isDebug;
}
