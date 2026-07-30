import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/jest.setup.ts"],
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  globals: {
    "ts-jest": {
      useESM: true,
      tsconfig: "tsconfig.json"
    }
  }
};

export default config;
