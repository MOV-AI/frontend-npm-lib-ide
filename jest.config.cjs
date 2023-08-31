module.exports = {
  verbose: true,
  transformIgnorePatterns: [
    "/dist/",
    "/node_modules/(?!(?:@mov-ai/.*|@babylonjs/core)/)",
  ],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  testEnvironment: "jsdom",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  moduleNameMapper: {
    "^@babylonjs/core$": "<rootDir>/__mocks__/@babylonjs/core.js",
    "\\.(svg)$": "<rootDir>/__mocks__/mockSvg.js",
    // ... possibly other mappings
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx)?$": "@swc/jest",
  }
};
