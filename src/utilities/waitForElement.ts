import { Debug } from "./debug";

// ---------------------------------------------

const debug = new Debug("content", "Mint - Utilites - waitForElement");

/**
 * 
 * waitForElement - Tries to wait for an element to appear on the page and then calls
 * the callback function. If it fails too many times, calls the failure callback funtion
 * 
 * @param {Object}    args
 * @param {String}    args.selector - Selector to search for
 * @param {String}    args.withText - Text that must be in the selector (Optional)
 * @param {Function}  args.callback - Function to call on success
 * @param {Function}  args.failureCallback - Function to call on failure (Optional)
 * @param {Element}   args.initialContainer - Container to limit search to (Optional)
 * @param {Number}    args.failureAttempts - Allowed number of failure attempts. Default is 5 seconds. (Optional)
 * @param {Number}    args._timesRun - Internal - How many loops we've run through (Optional)
 */

export const waitForElement = ({
  selector,
  withText = null,
  callback,
  initialContainer,
  failureCallback = (sel) => { debug.log(`Failed to find ${sel}`); },
  failureAttempts = 10,
  _timesRun = 0,
}: {
  selector: string,
  withText?: string | null,
  callback: (foundElement?: HTMLElement) => void,
  initialContainer?: Element,
  failureCallback?: (sel?: string) => void,
  failureAttempts?: number,
  _timesRun?: number,
}): void => {
  // Bail and call failure if we've reached out fail limit
  if (_timesRun >= failureAttempts) {
    failureCallback(selector);
    return;
  }

  // Get our list of elements to search through.
  const queryContainer = initialContainer ? initialContainer : document;
  const elements = queryContainer.querySelectorAll(selector);

  // Bail & Recur if we didn't find the element.
  if (!elements.length) {
    setTimeout(() => waitForElement({
      selector,
      withText,
      callback,
      initialContainer,
      failureCallback,
      failureAttempts,
      _timesRun: _timesRun + 1
    }), 500);
    return;
  }

  // If we don't need specific text to have appeared, we can just return the first of what we found.
  if (!withText) {
    callback(elements[0] as HTMLElement);
    return;
  }

  // Loop through our found items and try to find the one that has text that matches
  let foundText: boolean = false;
  let foundElement: HTMLElement | null = null;
  elements.forEach((element) => {
    if (!foundElement && (element as HTMLElement).innerText.toLowerCase().includes(withText.toLowerCase())) {
      foundText = true;
      foundElement = element as HTMLElement;
      return;
    }
  });

  // Bail & Recur if we didn't find any text
  if (!foundText) {
    setTimeout(() => waitForElement({
      selector,
      withText,
      callback,
      initialContainer,
      failureCallback,
      failureAttempts,
      _timesRun: _timesRun + 1
    }), 500);
    return
  }

  // Success! Call the callback funtion with our found item
  callback(foundElement);
};
