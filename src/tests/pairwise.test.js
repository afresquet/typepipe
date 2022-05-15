const { pairwise } = require("../pairwise");

describe("pipeline lib pairwise step", () => {
	const value = 10;
	const context = { foo: "bar" };
	const global = { bar: "foo" };

	test("returns both the previous and new value", () => {
		const fn = jest.fn(x => x * 2);

		const result = pairwise(fn)(value, context, global);

		expect(result).toStrictEqual([value, 20]);
		expect(fn).toHaveBeenCalledWith(value, context, global);
	});

	test("works with promises", () => {
		const fn = jest.fn(async x => x * 2);

		const result = pairwise(fn)(value, context, global);

		expect(result).resolves.toStrictEqual([value, 20]);
		expect(fn).toHaveBeenCalledWith(value, context, global);
	});
});
