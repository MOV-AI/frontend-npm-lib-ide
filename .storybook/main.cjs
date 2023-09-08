const webpack = require("webpack");
module.exports = {
  stories: ["../src/stories/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "storybook-addon-mock/register"
  ],

  framework: "@storybook/react",

  webpackFinal: async config => {
    const finalConfig = config;

    finalConfig.entry = {
      main: ["./src/createThemes.js"].concat(finalConfig.entry),
      "editor.worker": "monaco-editor-core/esm/vs/editor/editor.worker.js"
    };

    finalConfig.resolve.extensions = [".js", ".jsx", ".ts", ".tsx", ".json", ".ttf"];
    finalConfig.resolve.alias.react = process.cwd() + "/node_modules/react";

    finalConfig.resolve.alias.vscode = require.resolve(
      "@codingame/monaco-languageclient/lib/vscode-compatibility"
    );

    finalConfig.resolve.alias["@tty-pt/styles"] = process.cwd() + "/node_modules/@tty-pt/styles/dist";
    finalConfig.resolve.alias["@mov-ai/mov-fe-lib-react/dist/Themes"] = process.cwd() + "/node_modules/@mov-ai/mov-fe-lib-react/dist/Themes.js";
    finalConfig.resolve.alias["@mov-ai/mov-fe-lib-core"] = process.cwd() + "/node_modules/@mov-ai/mov-fe-lib-core/dist";

    finalConfig.output.filename = "[name].bundle.js";

    finalConfig.plugins = finalConfig.plugins.map(plugin => {
      if (plugin.constructor.name === "IgnorePlugin") {
        return new webpack.IgnorePlugin({
          resourceRegExp: plugin.options.resourceRegExp,
          contextRegExp: plugin.options.contextRegExp
        });
      }
      return plugin;
    });
    return finalConfig;
  },

  core: {
    builder: "webpack5"
  }
};
