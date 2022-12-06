const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: {
    lodash: ["lodash"]
  },
  output: {
    filename: "[name].dll.js",
    path: path.resolve(__dirname, "dll"),
    library: "[name]_[fullhash]",
    clean: true
  },
  plugins: [
    new webpack.DllPlugin({
      context: __dirname,
      name: "[name]_[fullhash]",
      path: path.join(__dirname, "dll", "manifest.json")
    })
  ]
};