const PipelineBuilder = require("../Pipeline").default;

describe("pipeline lib PipelineBuilder", () => {
	const functions = [
		jest.fn(x => x + 1),
		jest.fn(x => x * 2),
		jest.fn(x => x.toString()),
	];
	const context = { foo: "bar" };
	const global = { bar: "foo" };

	beforeEach(jest.clearAllMocks);

	test("stores functions to be composed", () => {
		const pipeline = new PipelineBuilder()
			.pipe(functions[0])
			.pipe(functions[1])
			.pipe(functions[2]);

		expect(pipeline.functions).toStrictEqual(functions);
	});

	test("executes functions in order and passes the contexts", () => {
		const pipeline = new PipelineBuilder()
			.pipe(functions[0])
			.pipe(functions[1])
			.pipe(functions[2]);

		const result = pipeline.run(1, context, global);

		expect(result).toBe("4");

		expect(functions[0]).toHaveBeenCalledWith(1, context, global);
		expect(functions[1]).toHaveBeenCalledWith(2, context, global);
		expect(functions[2]).toHaveBeenCalledWith(4, context, global);
	});

	test("can be composed", () => {
		const pipeline = new PipelineBuilder()
			.pipe(functions[0])
			.pipe(functions[1])
			.pipe(functions[2]);

		const result = pipeline.run(1, context, global);

		expect(result).toBe("4");

		expect(functions[0]).toHaveBeenCalledWith(1, context, global);
		expect(functions[1]).toHaveBeenCalledWith(2, context, global);
		expect(functions[2]).toHaveBeenCalledWith(4, context, global);
	});

	test("can be nested", () => {
		const pipeline = new PipelineBuilder()
			.pipe(functions[0])
			.pipe(new PipelineBuilder().pipe(functions[1]).compose())
			.pipe(functions[2]);

		const result = pipeline.run(1, context, global);

		expect(result).toBe("4");

		expect(functions[0]).toHaveBeenCalledWith(1, context, global);
		expect(functions[1]).toHaveBeenCalledWith(2, context, global);
		expect(functions[2]).toHaveBeenCalledWith(4, context, global);
	});

	test("works with promises", () => {
		const fn = jest.fn(async x => x * 2);

		const pipeline = new PipelineBuilder()
			.pipe(functions[0])
			.pipe(fn)
			.pipe(functions[2]);

		const result = pipeline.run(1, context, global);

		expect(result).resolves.toBe("4");
	});
});
