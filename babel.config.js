// babel.config.js
module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current"
        }
      }
    ],
    "@babel/preset-react"
  ],
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
                { "useESModules": true, "helpers": true, "loose": true }
              ]
  ]
};
