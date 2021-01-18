const webpack = require("webpack");
const path = require("path");
const glob = require("glob");
const CopyPlugin = require("copy-webpack-plugin");

const entryPoints = {};

glob.sync("./src/**/*.ts").forEach((item) => {
  const key = item.replace("./src/", "").replace(".ts", "");
  entryPoints[key] = item;
});

module.exports = {
  entry: entryPoints,
  output: {
    filename: "[name].js",
    path: path.join(__dirname, "../dist/js"),
  },
  optimization: {
    splitChunks: {
      name: "vendor",
      chunks: "initial",
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json"],
    modules: ["node_modules"],
  },
  plugins: [
    // exclude locale files in moment
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new CopyPlugin({
      patterns: [
        { from: ".", to: "../", context: "public" },
        { from: "node_modules/jquery/dist", to: "external/jquery" },
        { from: "node_modules/noty/lib", to: "external/noty" },
        {
          from: "stellar/assets/js",
          globOptions: {
            ignore: ["**/jquery.min.js*"],
          },
          to: "external/stellar",
        },
        {
          from: "stellar/assets/css",
          globOptions: {
            ignore: ["**/fontawesome*", "**/images/*"],
          },
          to: "external/stellar",
        },
      ],
    }),
  ],
};
