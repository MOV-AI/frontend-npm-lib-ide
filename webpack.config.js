const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  entry: {
    index: "./index.js",
    Themes: "./src/themes.js"
  },
  output: {
    path: path.resolve("./"),
    filename: "dist/[name].js",
    library: "MovaiIDE",
    libraryTarget: "umd"
  },
  target: "web",
  devtool: "source-map",
  externals: [nodeExternals()],
  resolve: {
    extensions: [".js", ".jsx"]
  },
  module: {
    rules: [
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
        }
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "svg-url-loader",
            options: {
              limit: 10000
            }
          }
        ]
      },
      {
        test: /\.(jpg|png)$/,
        use: {
          loader: "url-loader"
        }
      }
    ]
  }
};
