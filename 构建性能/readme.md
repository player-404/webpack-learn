# webpack 构建性能优化

## 1.DllPlugin 优化

### 什么是 DLL

DLL(Dynamic Link Library)文件为动态链接库文件,在 Windows 中，许多应用程序并不是一个完整的可执行文件，它们被分割成一些相对独立的动态链接库，即 DLL 文件，放置于系统中。当我们执行某一个程序时，相应的 DLL 文件就会被调用。

### 为什么要使用 Dll

通常来说，我们的代码都可以至少简单区分成业务代码和第三方库。如果不做处理，每次构建时都需要把所有的代码重新构建一次，耗费大量的时间。然后大部分情况下，很多第三方库的代码并不会发生变更（除非是版本升级），这时就可以用到 dll：把复用性较高的第三方模块打包到动态链接库中，在不升级这些库的情况下，动态库不需要重新打包，每次构建只重新打包业务代码

### 使用

1. 使用 DLLPlugin 打包需要分离到动态库的模块
2. 在主构建配置文件使用动态库文件
3. 在入口文件引入 dll 文件。

### 作用

1. 分离代码

业务代码和第三方模块可以被打包到不同的文件里，这个有几个好处：

避免打包出单个文件的大小太大，不利于调试
将单个大文件拆成多个小文件之后，一定情况下有利于加载（不超出浏览器一次性请求的文件数情况下，并行下载肯定比串行快）

2. 提升构建速度。第三方库没有变更时，由于我们只构建业务相关代码，相比全部重新构建自然要快的多

### 注意

从前面可以看到 dll 带来的优点，但并不意味着我们就应该把除业务代码外的所有代码全部都丢到 dll 中，举一个例子：

1.对于 lodash 这种第三方库，正确的用法是只去 import 所需的函数（用什么引什么），例如：

```js
// 正确用法
import isPlainObject from "lodash/isPlainObject";

//错误用法
import { isPlainObject } from "lodash";
```

这两种写法的差别在于，打包时 webpack 会根据引用去打包依赖的内容，所以第一种写法，webpack 只会打包 lodash 的 isPlainObject 库，第二种写法却会打包整个 lodash。现在假设在项目中只是用到不同模块对 lodash 里的某几个函数并且没有对于某个函数重复使用非常多次，那么这时候把 lodash 添加到 dll 中，带来的收益就并不明显，反而导致 2 个问题：

由于打包了整个 lodash，而导致打包后的文件总大小（注意是总大小）比原先还要大
在 dll 打包太多内容也需要耗费时间，虽然我们一般只在第三方模块更新之后才进行重新预编译（就是 dll 打包的过程），但是如果这个时间太长的话体验也不好

### 建议

对于常见第三方库是否要放进 dll 可能比较明确（比如 react 系列打包一般肯定不亏），但是还有一些就要结合具体的项目内容来进行判断和取舍。

## 2.减小 chunk 的体积

减少编译结果的整体大小，以提高构建性能。尽量保持 chunk 体积小：

-   使用数量更少/体积更小的 library。
-   在多页面应用程序中使用 SplitChunksPlugin。
-   在多页面应用程序中使用 SplitChunksPlugin ，并开启 async 模式。
-   移除未引用代码。
-   只编译你当前正在开发的那些代码。

### 使用 SplitChunksPlugin

最初，chunks（以及内部导入的模块）是通过内部 webpack 图谱中的父子关系关联的。CommonsChunkPlugin 曾被用来避免他们之间的重复依赖，但是不可能再做进一步的优化。
从 webpack v4 开始，移除了 CommonsChunkPlugin，取而代之的是 optimization.splitChunks。

#### 默认拆分

-   新的 chunk 可以被共享，或者模块来自于 node_modules 文件夹
-   新的 chunk 体积大于 20kb（在进行 min+gz 之前的体积）
-   当按需加载 chunks 时，并行请求的最大数量小于或等于 30
-   当加载初始化页面时，并发请求的最大数量小于或等于 30
    当尝试满足最后两个条件时，最好使用较大的 chunks。

[参考文档](https://webpack.docschina.org/plugins/split-chunks-plugin#root)

## 3.持久化缓存

在 webpack 中使用 cache 选项

[参考文档](https://webpack.docschina.org/configuration/cache)

## 4.开发环境下的优化

### - 增量编译

使用 webpack 的 watch mode(监听模式)。而不使用其他工具来 watch 文件和调用 webpack 。内置的 watch mode 会记录时间戳并将此信息传递给 compilation 以使缓存失效。

在某些配置环境中，watch mode 会回退到 poll mode(轮询模式)。监听许多文件会导致 CPU 大量负载。在这些情况下，可以使用 watchOptions.poll 来增加轮询的间隔时间。

### - 在内存中编译

下面几个工具通过在内存中（而不是写入磁盘）编译和 serve 资源来提高性能：

-   webpack-dev-server
-   webpack-hot-middleware
-   webpack-dev-middleware

### - Devtool

需要注意的是不同的 devtool 设置，会导致性能差异。

-   "eval" 具有最好的性能，但并不能帮助你转译代码。
-   如果你能接受稍差一些的 map 质量，可以使用 cheap-source-map 变体配置来提高性能
-   使用 eval-source-map 变体配置进行增量编译。

### - 最小化 entry chunk

确保在生成 entry chunk 时，尽量减少其体积以提高性能。下面的配置为运行时代码创建了一个额外的 chunk，所以它的生成代价较低:

```js
module.exports = {
    // ...
    optimization: {
        runtimeChunk: true,
    },
};
```

### - 避免额外的优化步骤

Webpack 通过执行额外的算法任务，来优化输出结果的体积和加载性能。这些优化适用于小型代码库，但是在大型代码库中却非常耗费性能：

```js
module.exports = {
    // ...
    optimization: {
        /* 如果模块已经包含在所有父级模块中，告知 webpack 从 chunk 中检测出这些模块，或移除这些模块。 */
        removeAvailableModules: false,
        // 如果 chunk 为空，告知 webpack 检测或移除这些 chunk。
        removeEmptyChunks: false,
        // 对于动态导入模块，默认使用 webpack v4+ 提供的全新的通用分块策略(common chunk strategy)。请在 SplitChunksPlugin 页面中查看配置其行为的可用选项。
        splitChunks: false,
    },
};
```

### - 输出结果不携带路径信息

Webpack 会在输出的 bundle 中生成路径信息。然而，在打包数千个模块的项目中，这会导致造成垃圾回收性能压力。在 options.output.pathinfo 设置中关闭：

```js
module.exports = {
    // ...
    output: {
        pathinfo: false,
    },
};
```
