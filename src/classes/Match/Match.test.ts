import Match from ".";
import {
	Context,
	context,
	Global,
	global,
	TestFn,
	value,
} from "../../utils/tests";

describe("Match class", () => {
	const condition1: TestFn<number, boolean> = jest.fn(
		(_, y) => y.foo === "bar"
	);
	const fn1: TestFn<number, number> = jest.fn(x => x * 2);
	const condition2: TestFn<number, boolean> = jest.fn(
		(_, y) => y.foo === "baz"
	);
	const fn2: TestFn<number, number> = jest.fn(x => x / 2);
	const otherwise = jest.fn(x => x / 2);

	const match = new Match<number, Context, Global>()
		.on(condition1, fn1)
		.on(condition2, fn2)
		.otherwise(otherwise);

	beforeEach(jest.clearAllMocks);

	test("executes function if the condition matches", () => {
		const actual = match.run(value, context, global);
		const expected = 20;

		expect(actual).toBe(expected);
		expect(condition1).toHaveBeenCalledWith(value, context, global);
		expect(fn1).toHaveBeenCalledWith(value, context, global);
	});

	test("doesn't execute the function if the condition doesn't match", () => {
		const ctx: Context = { foo: "baz" };

		const actual = match.run(value, ctx, global);
		const expected = 5;

		expect(actual).toBe(expected);
		expect(condition1).toHaveBeenCalledWith(value, ctx, global);
		expect(fn1).not.toHaveBeenCalled();
		expect(condition2).toHaveBeenCalledWith(value, ctx, global);
		expect(fn2).toHaveBeenCalledWith(value, ctx, global);
	});

	test("calls 'otherwise' function if no condition matches", () => {
		const ctx: Context = { foo: "foo" };

		const actual = match.run(value, ctx, global);
		const expected = 5;

		expect(actual).toBe(expected);
		expect(condition1).toHaveBeenCalledWith(value, ctx, global);
		expect(fn1).not.toHaveBeenCalled();
		expect(otherwise).toHaveBeenCalledWith(value, ctx, global);
	});

	test("composes to a function", () => {
		const composed = match.compose();

		const actual = composed(value, context, global);
		const expected = 20;

		expect(actual).toBe(expected);
		expect(condition1).toHaveBeenCalledWith(value, context, global);
		expect(fn1).toHaveBeenCalledWith(value, context, global);
	});

	test("throws an error if a condition is a promise", () => {
		const badCondition = jest.fn(async (_, y) => y.run === 1) as any;

		const badMatch = new Match<number, Context, Global>().on(badCondition, fn1);

		const actual = () => badMatch.run(value, context, global);

		expect(actual).toThrowError("Condition can't be a promise");
		expect(badCondition).toHaveBeenCalledWith(value, context, global);
		expect(fn1).not.toHaveBeenCalled();
	});

	test("throws an error if no condition matches and no 'otherwise' function was provided", () => {
		const badMatch = new Match<number, Context, Global>().on(condition2, fn1);

		const actual = () => badMatch.run(value, context, global);

		expect(actual).toThrowError(
			"Condition didn't match and no 'otherwise' function was provided"
		);
		expect(condition2).toHaveBeenCalledWith(value, context, global);
		expect(fn1).not.toHaveBeenCalled();
	});
});
