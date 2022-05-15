const { defaults } = require("jest-config");

module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	transform: {
		"^.+\\.ts$": "ts-jest",
	},
	testMatch: ["**/*.test.js"],
	moduleFileExtensions: [...defaults.moduleFileExtensions, "ts"],
};
