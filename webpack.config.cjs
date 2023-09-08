const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve("./"),
    filename: "dist/index.js",
    library: "MovaiIDE",
    libraryTarget: "amd",
    /* umdNamedDefine: true, */
  },
  target: "web",
  devtool: "source-map",
  externals: [nodeExternals()],
  resolve: {
    symlinks: true,
    alias: {
      // deepmerge: require.resolve('deepmerge/dist/cjs.js'),
      vscode: require.resolve(
        "@codingame/monaco-languageclient/lib/vscode-compatibility"
      )
    },
    mainFields: ['main', 'module'],
    extensions: [".js", ".jsx"]
  },
  experiments: {
    /* outputModule: true, */
  };
  module: {
    rules: [
      {
        test: /\.(ts|tsx)?$/,
        use: 'ts-loader',
        exclude: /node_modules/
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
