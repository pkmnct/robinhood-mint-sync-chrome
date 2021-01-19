const fs = require("fs");
const prettier = require("prettier");
const package = require("./package.json");

const manifestPath = "./public/manifest.json";
const manifest = require(manifestPath);

manifest.version = package.version;

const formattedOutput = prettier.format(JSON.stringify(manifest), { parser: "json" });

fs.writeFile(manifestPath, formattedOutput, (err) => {
  if (err) return console.error(err);
  console.log("Updated manifest.json");
});
