const Match = require("../Match").default;

describe("Match class", () => {
	const value = 10;

	test("executes pipeline if the condition matches", () => {
		const context = { run: 1 };
		const global = { foo: "bar" };

		const matcher = jest.fn((x, y) => y.run === 1);
		const step = jest.fn(x => x * 2);

		const match = new Match().on(matcher, step);

		const result = match.run(value, context, global);

		expect(result).toBe(20);
		expect(matcher).toHaveBeenCalledWith(value, context, global);
		expect(step).toHaveBeenCalledWith(value, context, global);
	});

	test("doesn't execute pipeline if the condition doesn't match", () => {
		const context = { run: 2 };
		const global = { foo: "bar" };

		const matcher1 = jest.fn((x, y) => y.run === 1);
		const step1 = jest.fn(x => x * 2);
		const matcher2 = jest.fn((x, y) => y.run === 2);
		const step2 = jest.fn(x => x / 2);

		const match = new Match().on(matcher1, step1).on(matcher2, step2);

		const result = match.run(value, context, global);

		expect(result).toBe(5);
		expect(matcher1).toHaveBeenCalledWith(value, context, global);
		expect(step1).not.toHaveBeenCalled();
		expect(matcher2).toHaveBeenCalledWith(value, context, global);
		expect(step2).toHaveBeenCalledWith(value, context, global);
	});

	test("calls 'otherwise' pipeline if no condition matches", () => {
		const context = { run: 2 };
		const global = { foo: "bar" };

		const matcher = jest.fn((x, y) => y.run === 1);
		const step = jest.fn(x => x * 2);
		const otherwise = jest.fn(x => x / 2);

		const match = new Match().on(matcher, step).otherwise(otherwise);

		const result = match.run(value, context, global);

		expect(result).toBe(5);
		expect(matcher).toHaveBeenCalledWith(value, context, global);
		expect(step).not.toHaveBeenCalled();
		expect(otherwise).toHaveBeenCalledWith(value, context, global);
	});

	test("throws an error if condition is a promise", () => {
		const context = { run: 1 };
		const global = { foo: "bar" };

		const matcher = jest.fn(async (x, y) => y.run === 1);
		const step = jest.fn(x => x * 2);

		const match = new Match().on(matcher, step);

		const fn = () => match.run(value, context, global);

		expect(fn).toThrowError("Condition can't be a promise");
		expect(matcher).toHaveBeenCalledWith(value, context, global);
		expect(step).not.toHaveBeenCalled();
	});

	test("throws an error if no condition matches and no 'otherwise' function was provided", () => {
		const context = { run: 2 };
		const global = { foo: "bar" };

		const matcher = jest.fn((x, y) => y.run === 1);
		const step = jest.fn(x => x * 2);

		const fn = () => new Match().on(matcher, step).run(value, context, global);

		expect(fn).toThrowError(
			"Condition didn't match and no 'otherwise' pipeline was provided"
		);
		expect(matcher).toHaveBeenCalledWith(value, context, global);
		expect(step).not.toHaveBeenCalled();
	});
});
