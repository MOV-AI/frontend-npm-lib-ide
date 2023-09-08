// babel.config.js
module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        "useBuiltIns": "usage", // or "entry"
        "corejs": 3,
        targets: {
          node: "current"
        }
      }
    ],
    "@babel/preset-react",
    "@babel/preset-typescript"
  ],
  plugins: [
    ["@babel/plugin-proposal-class-properties", { loose: true }],
    ["@babel/plugin-transform-runtime", { loose: true }],
    ["@babel/plugin-proposal-private-methods", { loose: true }],
    ["@babel/plugin-transform-private-property-in-object", { loose: true }]
  ]
};
