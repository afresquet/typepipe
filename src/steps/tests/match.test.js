const { match } = require("../match");

describe("match step", () => {
	const matchFn = jest.fn(m =>
		m
			.on(
				x => x >= 5,
				() => true
			)
			.on(
				x => x < 5,
				() => false
			)
	);

	test("passes a Match to the given function", () => {
		match(matchFn);

		expect(matchFn).toHaveBeenCalled();
	});

	test("returns a pipeline function that executes the Match configured with the given function", () => {
		const result = match(matchFn)(10);

		expect(result).toBe(true);
	});
});
