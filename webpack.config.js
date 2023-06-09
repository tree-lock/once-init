/** @type import("webpack").Configuration } */
module.exports = {
  entry: "./src/index.ts",
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
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    library: "OnceInit",
    filename: "index.js",
    globalObject: "this",
    libraryTarget: "umd", //支持库的引入方式
  },
};
