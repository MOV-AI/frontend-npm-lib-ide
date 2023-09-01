export default {
  verbose: true,
  transformIgnorePatterns: [
    "/dist/",
    "/../../libs/(?!(core)/)",
    "/node_modules/(?!(@babylonjs/core|@mov-ai/mov-fe-lib-core)/)"
  ],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  testEnvironment: "jsdom",
  moduleFileExtensions: ["ts", "tsx", "js", "mjs", "jsx", "json", "node"],
  moduleNameMapper: {
    "^@babylonjs/core$": "<rootDir>/__mocks__/@babylonjs/core.js",
    "\\.(svg)$": "<rootDir>/__mocks__/mockSvg.js",
    // ... possibly other mappings
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx)?$": "@swc/jest",
  }
};

