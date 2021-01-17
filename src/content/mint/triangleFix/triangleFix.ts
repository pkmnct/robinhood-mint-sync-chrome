import { Debug } from "../../../utilities/debug";

const debug = new Debug("content", "Mint - Triangle Fix");

chrome.storage.sync.get({ fixTriangle: true }, (result) => {
  if (result.fixTriangle)
    document
      .getElementsByTagName("body")[0]
      .classList.add("rhmsc-fix-triangle");
});
