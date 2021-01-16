export const waitForElement = (
  selector: string,
  withText: string | null,
  callback: () => void
): void => {
  const elements = document.querySelectorAll(selector);
  if (!elements.length)
    setTimeout(() => waitForElement(selector, withText, callback), 500);
  if (withText) {
    let foundText = false;
    elements.forEach((element) => {
      if ((element as HTMLElement).innerText.toLowerCase().includes(withText)) {
        foundText = true;
        return;
      }
    });
    if (foundText) {
      callback();
    } else {
      setTimeout(() => waitForElement(selector, withText, callback), 500);
    }
  } else {
    callback();
  }
};
