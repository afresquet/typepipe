import { context, global, TestFn, value } from "../../utils/tests";
import { assert } from "../assert";

describe("assert step", () => {
	const error = new Error("error");
	const fn: TestFn<number | undefined | null, any> = jest.fn(() => error);

	beforeEach(jest.clearAllMocks);

	test("asserts the value is not undefined or null", () => {
		const actual = assert(fn)(value, context, global);

		expect(actual).toBe(value);
		expect(fn).not.toHaveBeenCalled();
	});

	test("throws if the value is undefined", () => {
		const actual = () => assert(fn)(undefined, context, global);

		expect(actual).toThrow(error);
		expect(fn).toHaveBeenCalledWith(undefined, context, global);
	});

	test("throws if the value is null", () => {
		const actual = () => assert(fn)(null, context, global);

		expect(actual).toThrow(error);
		expect(fn).toHaveBeenCalledWith(null, context, global);
	});
});
