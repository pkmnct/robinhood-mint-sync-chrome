/**
 * waitForElement - Tries to wait for an element to appear on the page and then calls
 * the callback function. If it fails too many times, calls the onError callback function
 */
export interface WaitForElementOptions {
  // Selector to search for
  selector: string;
  // Text that must be in the selector (Optional)
  withText?: string | null;
  // Callback
  callback: (result: HTMLElement) => void;
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

export const waitForElement = (options: WaitForElementOptions): void => {
  const { selector, withText, onError, callback, initialContainer, failureAttempts = 50, _timesRun = 0, checkInterval = 500 } = options;

  // Bail and callback with Error if we've reached out fail limit
  if (_timesRun >= failureAttempts) {
    onError(new Error(`Unable to find selector "${selector}"` + withText ? ` with text "${withText}"` : ""));
    return;
  }

  // Get our list of elements to search through.
  const queryContainer = initialContainer ? initialContainer : document;
  const elements = queryContainer.querySelectorAll(selector);

  // If at least one element was found with the selector
  if (elements.length) {
    // If we don't need specific text to have appeared, we can just return the first of what we found.
    if (!withText) {
      callback(elements[0] as HTMLElement);
      return;
    }

    // Loop through our found items and try to find the one that has text that matches
    let foundText = false;
    for (const element of elements) {
      if ((element as HTMLElement).innerText.toLowerCase().includes(withText.toLowerCase())) {
        // Success! Call the callback function with our found item
        foundText = true;
        callback(element as HTMLElement);
        // Stop searching for elements
        break;
      }
    }
    if (foundText) return;
  }

  // Try again after checkInterval
  setTimeout(() => waitForElement({ ...options, _timesRun: _timesRun + 1 }), checkInterval);
};
