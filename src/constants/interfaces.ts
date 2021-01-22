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

export interface EventHandler {
  message: Message;
  sender: chrome.runtime.MessageSender;
}
