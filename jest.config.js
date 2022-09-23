module.exports = {
  testEnvironment: "jsdom",
  verbose: true,
  testRegex: "(/tests/.*|\\.(test|spec))\\.(ts|tsx|js)$",
  transformIgnorePatterns: ["node_modules/(?!(jest-)?)"],
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/src/__mocks__/fileMock.js"
  },
  globals: {
    window: {}
  }
};
