const { assert } = require("../assert");

describe("pipeline lib assert step", () => {
	const value = 10;

	const error = new Error("error");
	const fn = jest.fn(x => error);

	beforeEach(jest.clearAllMocks);
	test("asserts the value", () => {
		const result = assert(fn)(value);

		expect(result).toBe(value);
		expect(fn).not.toHaveBeenCalled();
	});

	test("throws if the value is undefined", () => {
		const cb = () => assert(fn)(undefined);

		expect(cb).toThrow(error);
		expect(fn).toHaveBeenCalled();
	});

	test("throws if the value is null", () => {
		const cb = () => assert(fn)(null);

		expect(cb).toThrow(error);
		expect(fn).toHaveBeenCalled();
	});
});
