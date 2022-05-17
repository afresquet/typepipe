import type { Context, Global, TestFn } from "../../types/tests";
import { tap } from "../tap";

describe("tap step", () => {
	const value = 10;
	const context: Context = { foo: "bar" };
	const global: Global = { bar: "foo" };

	test("return the same value", () => {
		const fn: TestFn<number, void> = jest.fn();

		const result = tap(fn)(value, context, global);

		expect(result).toBe(value);
		expect(fn).toHaveBeenCalledWith(value, context, global);
		expect(fn).not.toHaveReturnedWith(value);
	});

	test("work with promises", () => {
		const fn: TestFn<number, Promise<void>> = jest.fn(async () => {});

		const result = tap(fn)(value, context, global);

		expect(result).resolves.toBe(value);
		expect(fn).toHaveBeenCalledWith(value, context, global);
	});
});
