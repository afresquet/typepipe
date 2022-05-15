import type { Context, Global, TestFn } from "../../types/tests";
import Pipeline from "../Pipeline";

describe("Pipeline class", () => {
	const fn1: TestFn<number, number> = jest.fn(x => x + 1);
	const fn2: TestFn<number, number> = jest.fn(x => x * 2);
	const fn3: TestFn<number, string> = jest.fn(x => x.toString());

	const context: Context = { foo: "bar" };
	const global: Global = { bar: "foo" };

	beforeEach(jest.clearAllMocks);

	test("executes functions in order and passes the contexts", () => {
		const pipeline = new Pipeline<number, Context, Global>()
			.pipe(fn1)
			.pipe(fn2)
			.pipe(fn3);

		const result = pipeline.run(1, context, global);

		expect(result).toBe("4");

		expect(fn1).toHaveBeenCalledWith(1, context, global);
		expect(fn2).toHaveBeenCalledWith(2, context, global);
		expect(fn3).toHaveBeenCalledWith(4, context, global);
	});

	test("can be composed", () => {
		const pipeline = new Pipeline<number, Context, Global>()
			.pipe(fn1)
			.pipe(fn2)
			.pipe(fn3);

		const result = pipeline.run(1, context, global);

		expect(result).toBe("4");

		expect(fn1).toHaveBeenCalledWith(1, context, global);
		expect(fn2).toHaveBeenCalledWith(2, context, global);
		expect(fn3).toHaveBeenCalledWith(4, context, global);
	});

	test("can be nested", () => {
		const pipeline = new Pipeline<number, Context, Global>()
			.pipe(fn1)
			.pipe(new Pipeline<number, Context, Global>().pipe(fn2).compose())
			.pipe(fn3);

		const result = pipeline.run(1, context, global);

		expect(result).toBe("4");

		expect(fn1).toHaveBeenCalledWith(1, context, global);
		expect(fn2).toHaveBeenCalledWith(2, context, global);
		expect(fn3).toHaveBeenCalledWith(4, context, global);
	});

	test("works with promises", () => {
		const fn = jest.fn(async x => x * 2);

		const pipeline = new Pipeline<number, Context, Global>()
			.pipe(fn1)
			.pipe(fn)
			.pipe(fn3);

		const result = pipeline.run(1, context, global);

		expect(result).resolves.toBe("4");
	});
});
