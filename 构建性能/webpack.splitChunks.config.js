// splitChunksPlugin 使用
const path = require("path");
module.exports = {
    entry: "./src/index.js",
    output: {
        filanme: "[name].boundle.js",
        path: path.resolve(__dirname, "dist"),
        clean: true,
    },
    // splitChunksPlugin: 用来避免他们之间的重复依赖
    optimization: {
        splitChunks: {
            // 指定名称的分隔符
            automaticNameDelimiter: "-",
            // 选择哪些 chunk 进行优化, 可选值：all 全部， async 异步， initial
            chunks: "all",
            // 也可以为一个函数
            /* chunks(chunk) {
                // 不包括名为 my-excluded-chunk 的包
                return chunk.name !== "my-excluded-chunk";
            }, */

            // 按需加载时的最大并行请求数。
            maxAsyncRequests: 30,
            // 按需加载时的最大并行请求数。
            maxInitialRequests: 30,
            // 生成 chunk 的最小体积（以 bytes 为单位）
            minSize: 20000,
            // 生成 chunk 所需的主 chunk（bundle）的最小体积（以字节为单位）缩减。这意味着如果分割成一个 chunk 并没有减少主 chunk（bundle）的给定字节数，它将不会被分割，即使它满足 splitChunks.minSize。
            // minSizeReduction:
            // 缓存
            cacheGroups: {},
        },
    },
};
