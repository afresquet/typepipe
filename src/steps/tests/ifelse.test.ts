import type { Context, Global, TestFn } from "../../types/tests";
import { ifelse } from "../ifelse";

describe("ifelse step", () => {
	const value = 10;
	const context: Context = { foo: "bar" };
	const global: Global = { bar: "foo" };

	const then: TestFn<number, number> = jest.fn(x => x * 2);
	const otherwise: TestFn<number, number> = jest.fn(x => x / 2);

	beforeEach(jest.clearAllMocks);

	test("calls the first function if the condition is true", () => {
		const condition: TestFn<number, boolean> = jest.fn(x => x > 5);

		const result = ifelse(condition, then, otherwise)(value, context, global);

		expect(result).toBe(20);
		expect(condition).toHaveBeenCalledWith(value, context, global);
		expect(then).toHaveBeenCalledWith(value, context, global);
		expect(otherwise).not.toHaveBeenCalled();
	});

	test("calls the second function if the condition is false", () => {
		const condition: TestFn<number, boolean> = jest.fn(x => x < 5);

		const result = ifelse(condition, then, otherwise)(value, context, global);

		expect(result).toBe(5);
		expect(condition).toHaveBeenCalledWith(value, context, global);
		expect(then).not.toHaveBeenCalled();
		expect(otherwise).toHaveBeenCalledWith(value, context, global);
	});

	test("works with promises for true condition", async () => {
		const condition: TestFn<number, Promise<boolean>> = jest.fn(
			async x => x > 5
		);

		const result = await ifelse(condition, then, otherwise)(
			value,
			context,
			global
		);

		expect(result).toBe(20);
		expect(condition).toHaveBeenCalledWith(value, context, global);
		expect(then).toHaveBeenCalledWith(value, context, global);
		expect(otherwise).not.toHaveBeenCalled();
	});

	test("works with promises for false condition", async () => {
		const condition: TestFn<number, Promise<boolean>> = jest.fn(
			async x => x < 5
		);

		const result = await ifelse(condition, then, otherwise)(
			value,
			context,
			global
		);

		expect(result).toBe(5);
		expect(condition).toHaveBeenCalledWith(value, context, global);
		expect(then).not.toHaveBeenCalled();
		expect(otherwise).toHaveBeenCalledWith(value, context, global);
	});
});
