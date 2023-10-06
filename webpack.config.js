const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  entry: "./index.js",
  output: {
    path: path.resolve("./"),
    filename: "dist/index.js",
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
          options: {
            presets: ["@babel/preset-react", "@babel/preset-env"],
            plugins: [
              ["@babel/plugin-syntax-dynamic-import", { "loose": true }],
              ["@babel/plugin-syntax-import-meta", { "loose": true }],
              ["@babel/plugin-proposal-decorators", { "legacy": true, "loose": true }],
              ["@babel/plugin-transform-private-property-in-object", { "loose": true }],
              ["@babel/plugin-transform-class-properties", { "loose": true }],
              ["@babel/plugin-transform-private-methods", { "loose": true }],
              ["@babel/plugin-proposal-json-strings", { "loose": true }],
              [
                "@babel/plugin-transform-runtime",
                { useESModules: true, helpers: true, loose: true }
              ]
            ]
          }
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
