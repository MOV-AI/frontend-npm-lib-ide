module.exports = {
  stories: ["../src/stories/*/*.stories.(js|jsx|ts|tsx)", "../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],

  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "storybook-addon-mock/register"
  ],

  framework: {
    name: "@storybook/react-webpack5",
    options: {}
  },

  webpackFinal: async config => {
    const finalConfig = config;

    finalConfig.entry = {
      main: finalConfig.entry,
      "editor.worker": "monaco-editor-core/esm/vs/editor/editor.worker.js"
    };

    finalConfig.resolve.alias.vscode = require.resolve(
      "@codingame/monaco-languageclient/lib/vscode-compatibility"
    );

    finalConfig.output.filename = "[name].bundle.js";

    return finalConfig;
  },

  core: {
    builder: "webpack5",
  },

  docs: {
    autodocs: true
  }
};
