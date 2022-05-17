const { defaults } = require("jest-config");

module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	transform: {
		"^.+\\.ts$": "ts-jest",
	},
	testMatch: ["**/*.test.ts"],
	moduleFileExtensions: [...defaults.moduleFileExtensions, "ts"],
};
