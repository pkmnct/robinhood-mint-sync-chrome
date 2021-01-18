export const waitForElement = (selector: string, withText: string | null, callback: (foundElement?: HTMLElement) => void, initialContainer?: Element): void => {
  const queryContainer = initialContainer ? initialContainer : document;
  const elements = queryContainer.querySelectorAll(selector);
  if (!elements.length) {
    setTimeout(() => waitForElement(selector, withText, callback, initialContainer), 500);
  } else if (withText) {
    let foundText = false;
    let foundElement;
    elements.forEach((element) => {
      if ((element as HTMLElement).innerText.toLowerCase().includes(withText.toLowerCase())) {
        foundText = true;
        foundElement = element;
        return;
      }
    });
    if (foundText) {
      callback(foundElement);
    } else {
      setTimeout(() => waitForElement(selector, withText, callback, initialContainer), 500);
    }
  } else {
    callback(elements[0] as HTMLElement);
  }
};
