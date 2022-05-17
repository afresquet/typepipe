import Match from ".";
import type { Context, Global, TestFn } from "../../types/tests";

describe("Match class", () => {
	const value = 10;
	const context: Context = { foo: "bar" };
	const global: Global = { bar: "foo" };

	const matcher1: TestFn<number, boolean> = jest.fn((_, y) => y.foo === "bar");
	const step1: TestFn<number, number> = jest.fn(x => x * 2);
	const matcher2: TestFn<number, boolean> = jest.fn((_, y) => y.foo === "baz");
	const step2: TestFn<number, number> = jest.fn(x => x / 2);

	beforeEach(jest.clearAllMocks);

	test("executes pipeline if the condition matches", () => {
		const match = new Match<number, Context, Global>().on(matcher1, step1);

		const result = match.run(value, context, global);

		expect(result).toBe(20);
		expect(matcher1).toHaveBeenCalledWith(value, context, global);
		expect(step1).toHaveBeenCalledWith(value, context, global);
	});

	test("doesn't execute pipeline if the condition doesn't match", () => {
		const context2: Context = { foo: "baz" };

		const match = new Match<number, Context, Global>()
			.on(matcher1, step1)
			.on(matcher2, step2);

		const result = match.run(value, context2, global);

		expect(result).toBe(5);
		expect(matcher1).toHaveBeenCalledWith(value, context2, global);
		expect(step1).not.toHaveBeenCalled();
		expect(matcher2).toHaveBeenCalledWith(value, context2, global);
		expect(step2).toHaveBeenCalledWith(value, context2, global);
	});

	test("calls 'otherwise' pipeline if no condition matches", () => {
		const context2: Context = { foo: "baz" };

		const otherwise = jest.fn(x => x / 2);

		const match = new Match<number, Context, Global>()
			.on(matcher1, step1)
			.otherwise(otherwise);

		const result = match.run(value, context2, global);

		expect(result).toBe(5);
		expect(matcher1).toHaveBeenCalledWith(value, context2, global);
		expect(step1).not.toHaveBeenCalled();
		expect(otherwise).toHaveBeenCalledWith(value, context2, global);
	});

	test("composes to a pipeline function", () => {
		const match = new Match<number, Context, Global>()
			.on(matcher1, step1)
			.compose();

		const result = match(value, context, global);

		expect(result).toBe(20);
		expect(matcher1).toHaveBeenCalledWith(value, context, global);
		expect(step1).toHaveBeenCalledWith(value, context, global);
	});

	test("throws an error if condition is a promise", () => {
		const matcher = jest.fn(async (_, y) => y.run === 1) as any;

		const match = new Match<number, Context, Global>().on(matcher, step1);

		const fn = () => match.run(value, context, global);

		expect(fn).toThrowError("Condition can't be a promise");
		expect(matcher).toHaveBeenCalledWith(value, context, global);
		expect(step1).not.toHaveBeenCalled();
	});

	test("throws an error if no condition matches and no 'otherwise' function was provided", () => {
		const fn = () =>
			new Match<number, Context, Global>()
				.on(matcher2, step1)
				.run(value, context, global);

		expect(fn).toThrowError(
			"Condition didn't match and no 'otherwise' pipeline was provided"
		);
		expect(matcher2).toHaveBeenCalledWith(value, context, global);
		expect(step1).not.toHaveBeenCalled();
	});
});
