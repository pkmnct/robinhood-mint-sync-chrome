const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "production",
  entry: {
    "js/analytics": "./docs/js/analytics.js",
  },
  output: {
    path: path.join(__dirname, "../dist/docs"),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "docs", to: "." },
        { from: "images", to: "images" },
        { from: "public/images", to: "images" },
        { from: "public/css/main.css", to: "css/main.css" },
        { from: "node_modules/jquery/dist", to: "external/jquery" },
        {
          from: ".stellar/assets/js",
          globOptions: {
            ignore: ["**/jquery.min.js*"],
          },
          to: "external/stellar",
        },
        {
          from: ".stellar/assets/css",
          globOptions: {
            ignore: ["**/fontawesome*", "**/images/*"],
          },
          to: "external/stellar",
        },
      ],
    }),
  ],
  devServer: {
    contentBase: path.resolve(__dirname, "../docs"),
    port: 24763, // Spells CHRME on a phone key pad
    open: true,
  },
};
