const path = require("path");
const webpack = require("webpack");

module.exports = {
    entry: {
        // 第三方库
        lodash: ["lodash"],
    },
    output: {
        // 输出的动态链接库的文件名称，[name] 代表当前动态链接库的名称，
        filename: "[name].dll.js",
        path: path.resolve(__dirname, "dll"),
        // library必须和后面dllplugin中的name一致 后面会说明
        library: "[name]_[fullhash]",
        // clean: true,
    },
    plugins: [
        // 接入 DllPlugin
        new webpack.DllPlugin({
            // 动态链接库的全局变量名称，需要和 output.library 中保持一致
            // 该字段的值也就是输出的 manifest.json 文件 中 name 字段的值
            context: __dirname,
            name: "[name]_[fullhash]",
            // 描述动态链接库的 manifest.json 文件输出时的文件名称
            path: path.join(__dirname, "dll", "[name].manifest.json"),
        }),
    ],
};

/* 
  输出文件：
    1.dll.js 文件里是使用数组保存的模块，索引值就作为id
    2.json文件： 是用来描述对应的dll文件里保存的模块
*/
