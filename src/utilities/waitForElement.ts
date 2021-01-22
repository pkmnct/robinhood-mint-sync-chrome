// Constants.
import { WaitForElementOptions } from '../constants/interfaces';

// -------------------------------------------------------------------------------

/**
 * waitForElement - Tries to wait for an element to appear on the page and then calls
 * the callback function. If it fails too many times, calls the onError callback function
 * 
 * TODO: Refactor this to return a promise
 */
export const waitForElement = (options: WaitForElementOptions): void => {
  const { selector, withText, onError, callback, initialContainer, failureAttempts = 50, _timesRun = 0, checkInterval = 500, callbackData = {} } = options;

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
      callback(elements[0] as HTMLElement, callbackData);
      return;
    }

    // Loop through our found items and try to find the one that has text that matches
    let foundText = false;
    for (const element of elements) {
      if ((element as HTMLElement).innerText.toLowerCase().includes(withText.toLowerCase())) {
        // Success! Call the callback function with our found item
        foundText = true;
        callback(element as HTMLElement, callbackData);
        // Stop searching for elements
        break;
      }
    }
    if (foundText) return;
  }

  // Try again after checkInterval
  setTimeout(() => waitForElement({ ...options, _timesRun: _timesRun + 1 }), checkInterval);
};
