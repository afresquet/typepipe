import { context, global, TestFn, value } from "../../utils/tests";
import { pairwise } from "../pairwise";

describe("pairwise step", () => {
	const expected = [value, 20];

	test("returns both the previous and new value", () => {
		const fn: TestFn<number, number> = jest.fn(x => x * 2);

		const actual = pairwise(fn)(value, context, global);

		expect(actual).toStrictEqual(expected);
		expect(fn).toHaveBeenCalledWith(value, context, global);
	});

	test("returns both the previous and new value (async)", () => {
		const fn: TestFn<number, Promise<number>> = jest.fn(async x => x * 2);

		const actual = pairwise(fn)(value, context, global);

		expect(actual).resolves.toStrictEqual(expected);
		expect(fn).toHaveBeenCalledWith(value, context, global);
	});
});
