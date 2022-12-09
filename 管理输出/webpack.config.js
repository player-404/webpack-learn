const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
module.exports = {
    entry: {
        index: "./src/index.js",
    },
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "dist"),
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendors",
                    chunks: "all",
                },
            },
            chunks: "all",
        },
        runtimeChunk: "single",
    },
    plugins: [
        new HtmlWebpackPlugin({
            //生成 HTML 文档的标题
            title: "测试",
            filename: "[name].[contenthash].html",
            template: "./src/index.html",
        }),
    ],
};
