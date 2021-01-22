export interface Message {
  event: string;
  debug?: unknown;
  uninvested_cash?: string;
  crypto?: string;
  equities?: string;
  total_equity?: string;
  error?: Error;
  newProperties?: string;
  property?: string;
  accountName?: string;
}

export interface callbackDataOptions {
  request?: Message;
}

export interface WaitForElementOptions {
  // Selector to search for
  selector: string;
  // Text that must be in the selector (Optional)
  withText?: string | null;
  // Callback
  callback: (result: HTMLElement, callbackData: callbackDataOptions) => void;
  // A way to pass some additonal data to the callback
  callbackData?: callbackDataOptions;
  // Error Callback
  onError: (result: Error) => void;
  // Container to limit search to (Optional)
  initialContainer?: Element;
  // How often (in ms) to check for the new element. Defaults to 500ms
  checkInterval?: number;
  // Allowed number of failure attempts. Default is 50. (Optional)
  failureAttempts?: number;
  // Internal - How many loops we've run through (Optional)
  // TODO: perhaps convert waitForElement to class so this can be private
  _timesRun?: number;
}

export interface EventHandler {
  message: Message;
  sender: chrome.runtime.MessageSender;
}
