const { ifelse } = require("../ifelse");

describe("pipeline lib ifelse step", () => {
	const value = 10;
	const context = { foo: "bar" };
	const global = { foo: "bar" };

	test("calls the first function if the condition is true", () => {
		const condition = jest.fn(x => x > 5);
		const then = jest.fn(x => x * 2);
		const otherwise = jest.fn(x => x / 2);

		const result = ifelse(condition, then, otherwise)(value, context, global);

		expect(result).toBe(20);
		expect(condition).toHaveBeenCalledWith(value, context, global);
		expect(then).toHaveBeenCalledWith(value, context, global);
		expect(otherwise).not.toHaveBeenCalled();
	});

	test("calls the second function if the condition is false", () => {
		const condition = jest.fn(x => x < 5);
		const then = jest.fn(x => x * 2);
		const otherwise = jest.fn(x => x / 2);

		const result = ifelse(condition, then, otherwise)(value, context, global);

		expect(result).toBe(5);
		expect(condition).toHaveBeenCalledWith(value, context, global);
		expect(then).not.toHaveBeenCalled();
		expect(otherwise).toHaveBeenCalledWith(value, context, global);
	});

	test("returns the same value if the condition is false and no 'otherwise' function is passed", () => {
		const condition = jest.fn(x => x < 5);
		const then = jest.fn(x => x * 2);

		const result = ifelse(condition, then)(value, context, global);

		expect(result).toBe(value);
		expect(condition).toHaveBeenCalledWith(value, context, global);
		expect(then).not.toHaveBeenCalled();
	});

	test("works with promises for true condition", async () => {
		const condition = jest.fn(async x => x > 5);
		const then = jest.fn(x => x * 2);
		const otherwise = jest.fn(x => x / 2);

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
		const condition = jest.fn(async x => x < 5);
		const then = jest.fn(x => x * 2);
		const otherwise = jest.fn(x => x / 2);

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
