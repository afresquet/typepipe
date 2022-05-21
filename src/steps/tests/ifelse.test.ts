import { context, global, TestFn, value } from "../../utils/tests";
import { ifelse } from "../ifelse";

describe("ifelse step", () => {
	const then: TestFn<number, number> = jest.fn(x => x * 2);
	const otherwise: TestFn<number, number> = jest.fn(x => x / 2);

	beforeEach(jest.clearAllMocks);

	test("calls the 'then' function if the condition is true", () => {
		const condition: TestFn<number, boolean> = jest.fn(x => x > 5);

		const actual = ifelse(condition, then, otherwise)(value, context, global);
		const expected = 20;

		expect(actual).toBe(expected);
		expect(condition).toHaveBeenCalledWith(value, context, global);
		expect(then).toHaveBeenCalledWith(value, context, global);
		expect(otherwise).not.toHaveBeenCalled();
	});

	test("calls the 'otherwise' function if the condition is false", () => {
		const condition: TestFn<number, boolean> = jest.fn(x => x < 5);

		const actual = ifelse(condition, then, otherwise)(value, context, global);
		const expected = 5;

		expect(actual).toBe(expected);
		expect(condition).toHaveBeenCalledWith(value, context, global);
		expect(then).not.toHaveBeenCalled();
		expect(otherwise).toHaveBeenCalledWith(value, context, global);
	});

	test("calls the 'then' function if the condition is true (async)", async () => {
		const condition: TestFn<number, Promise<boolean>> = jest.fn(
			async x => x > 5
		);

		const actual = await ifelse(condition, then, otherwise)(
			value,
			context,
			global
		);
		const expected = 20;

		expect(actual).toBe(expected);
		expect(condition).toHaveBeenCalledWith(value, context, global);
		expect(then).toHaveBeenCalledWith(value, context, global);
		expect(otherwise).not.toHaveBeenCalled();
	});

	test("calls the 'otherwise' function if the condition is false (async)", async () => {
		const condition: TestFn<number, Promise<boolean>> = jest.fn(
			async x => x < 5
		);

		const actual = await ifelse(condition, then, otherwise)(
			value,
			context,
			global
		);
		const expected = 5;

		expect(actual).toBe(expected);
		expect(condition).toHaveBeenCalledWith(value, context, global);
		expect(then).not.toHaveBeenCalled();
		expect(otherwise).toHaveBeenCalledWith(value, context, global);
	});
});
