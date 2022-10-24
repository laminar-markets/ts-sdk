import type { Config } from "jest";

const config: Config = {
  collectCoverage: true,
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: ["/node_modules/"],
  coverageProvider: "v8",
  errorOnDeprecated: false,
  moduleFileExtensions: ["js", "ts"],
  preset: "ts-jest",
  rootDir: ".",
  roots: ["tests"],
  testEnvironment: "jest-environment-node",
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],
  testPathIgnorePatterns: ["/node_modules/"],
  testTimeout: 30000,
  verbose: true,
};

export default config;
