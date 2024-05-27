const path=require("path")

module.exports = {
    entry: './src/index.js',
    output: {
        // publicPath: "/",
        filename: "bundle.js"
    },
    devServer: {
        port:8080,
    }
}