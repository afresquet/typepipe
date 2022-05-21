import { context, global, TestFn, value } from "../../utils/tests";
import { tap } from "../tap";

describe("tap step", () => {
	test("returns the same value", () => {
		const fn: TestFn<number, void> = jest.fn();

		const actual = tap(fn)(value, context, global);

		expect(actual).toBe(value);
		expect(fn).toHaveBeenCalledWith(value, context, global);
		expect(fn).not.toHaveReturnedWith(value);
	});

	test("returns the same value (async)", () => {
		const fn: TestFn<number, Promise<void>> = jest.fn(async () => {});

		const actual = tap(fn)(value, context, global);

		expect(actual).resolves.toBe(value);
		expect(fn).toHaveBeenCalledWith(value, context, global);
		expect(fn).not.toHaveReturnedWith(value);
	});
});
