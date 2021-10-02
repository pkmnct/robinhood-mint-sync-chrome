/**
 * Removes dangerous html characters from a variable that will output as HTML.
 * Could potentially be replaced by a sanitization library.
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== "string") {
    return "";
  }
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
};
