// TODO: Using Noty this way doesn't work?
// import Noty from "noty";
export class Notification {
  private wrapper = document.createElement("div");
  private left = document.createElement("div");
  private right = document.createElement("div");
  private logo = document.createElement("img");
  private title = document.createElement("h5");
  private message = document.createElement("p");
  private actionContainer = document.createElement("p");
  private persistent = false;

  private setup = () => {
    this.wrapper.setAttribute("class", "notification-wrapper");

    this.left.setAttribute("class", "notification-left");
    this.right.setAttribute("class", "notification-right");

    this.logo.setAttribute("class", "notification-image");
    this.logo.setAttribute("src", chrome.extension.getURL("/images/icon128.png"));

    this.left.appendChild(this.logo);
    this.wrapper.appendChild(this.left);

    this.title.setAttribute("class", "notification-title");
    this.title.innerText = "Robinhood Mint Sync for Chrome";

    this.right.appendChild(this.title);

    this.actionContainer.setAttribute("class", "notification-action");
  };

  constructor(
    messageText: string,
    persistent: boolean,
    action?: {
      link: string;
      newTab?: boolean;
      text: string;
    }
  ) {
    this.setup();

    this.message.innerText = messageText;

    if (action && action.text && action.link) {
      const actionLink = document.createElement("a");
      actionLink.setAttribute("href", action.link);
      if (action.newTab) {
        actionLink.setAttribute("target", "_blank");
      }
      actionLink.setAttribute("class", "notification-action-link");
      actionLink.innerText = action.text;
      this.actionContainer.appendChild(actionLink);
    }

    this.right.appendChild(this.message);
    this.right.appendChild(this.actionContainer);
    this.wrapper.appendChild(this.right);

    this.persistent = persistent;
  }

  public show(): void {
    // For now, we are manually loading the Noty JS file via the manifest.json (content script).
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    new Noty({
      text: this.wrapper.innerHTML,
      timeout: this.persistent ? false : 15000,
      progressBar: true,
      closeWith: ["button"],
      theme: "relax",
    }).show();
  }
}
