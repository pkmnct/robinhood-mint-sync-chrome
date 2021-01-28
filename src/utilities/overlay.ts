export class Overlay {
  private wrapper = document.createElement("div");
  private setupWrapper = () => {
    this.wrapper.setAttribute(
      "style",
      "position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.75); text-align: center; padding-top: 25vh; color: #fff; z-index: 9999999999;"
    );
    this.wrapper.setAttribute("role", "dialog");
    this.wrapper.setAttribute("aria-label", "Robinhood Mint Sync");
    this.wrapper.setAttribute("id", "robinhood-mint-sync-overlay");
  };

  constructor(headerText: string, messageText: string) {
    this.setupWrapper();

    // Logo
    const image = document.createElement("img");
    image.setAttribute("src", chrome.extension.getURL("/images/icon512.png"));
    image.setAttribute("alt", "");
    image.setAttribute("style", "width: 256px");

    // Header
    const headerElement = document.createElement("h1");
    headerElement.setAttribute("style", "font-size: 2.4em; margin: 1em 0 .5em 0;");
    headerElement.innerText = headerText;

    // Message
    const messageElement = document.createElement("h4");
    messageElement.setAttribute("style", "font-size: 1.4em");
    messageElement.innerText = messageText;

    this.wrapper.appendChild(image);
    this.wrapper.appendChild(headerElement);
    this.wrapper.appendChild(messageElement);
    this.show();
  }

  public show(): void {
    document.body.appendChild(this.wrapper);
  }
}
