import type { Context, Global, TestFn } from "../../types/tests";
import { assert } from "../assert";

describe("assert step", () => {
	const value = 10;
	const context: Context = { foo: "bar" };
	const global: Global = { bar: "foo" };

	const error = new Error("error");
	const fn: TestFn<number | undefined | null, any> = jest.fn(() => error);

	beforeEach(jest.clearAllMocks);

	beforeEach(jest.clearAllMocks);
	test("asserts the value", () => {
		const result = assert(fn)(value, context, global);

		expect(result).toBe(value);
		expect(fn).not.toHaveBeenCalled();
	});

	test("throws if the value is undefined", () => {
		const cb = () => assert(fn)(undefined, context, global);

		expect(cb).toThrow(error);
		expect(fn).toHaveBeenCalled();
	});

	test("throws if the value is null", () => {
		const cb = () => assert(fn)(null, context, global);

		expect(cb).toThrow(error);
		expect(fn).toHaveBeenCalled();
	});
});
