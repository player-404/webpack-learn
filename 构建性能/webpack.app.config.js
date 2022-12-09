const path = require("path");
const webpack = require("webpack");

module.exports = {
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].[contenthash].js",
        clean: true,
    },
    plugins: [
        new webpack.DllReferencePlugin({
            context: __dirname,
            // require 映射文件
            manifest: require("./dll/lodash.manifest.json"),
        }),
    ],
};
