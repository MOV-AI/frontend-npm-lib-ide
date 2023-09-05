module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  rules: {
    // Add your rules here. For instance:
  },
  env: {
    "browser": true,
    "es2021": true
  },
  overrides: [],
  parserOptions: {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  rules: {
    "react/prop-types": 0,
    "react/display-name": 0,
    '@typescript-eslint/no-use-before-define': ['error']
  },
  settings: {
    react: {
      version: "detect",
    }
  }
}
