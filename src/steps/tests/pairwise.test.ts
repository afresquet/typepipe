import type { Context, Global, TestFn } from "../../types/tests";
import { pairwise } from "../pairwise";

describe("pairwise step", () => {
	const value = 10;
	const context: Context = { foo: "bar" };
	const global: Global = { bar: "foo" };

	test("returns both the previous and new value", () => {
		const fn: TestFn<number, number> = jest.fn(x => x * 2);

		const result = pairwise(fn)(value, context, global);

		expect(result).toStrictEqual([value, 20]);
		expect(fn).toHaveBeenCalledWith(value, context, global);
	});

	test("works with promises", () => {
		const fn: TestFn<number, Promise<number>> = jest.fn(async x => x * 2);

		const result = pairwise(fn)(value, context, global);

		expect(result).resolves.toStrictEqual([value, 20]);
		expect(fn).toHaveBeenCalledWith(value, context, global);
	});
});
