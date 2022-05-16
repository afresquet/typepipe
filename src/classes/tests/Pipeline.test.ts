import type { Context, Global, TestFn } from "../../types/tests";
import type { TypePipe } from "../../types/TypePipe";
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

	test("can change the context", () => {
		const ctx = "new context";
		const ctxFn: TestFn<number, string> = jest.fn(() => ctx);
		const fn: TypePipe.Function<number, string, string, Global> = jest.fn(x =>
			x.toString()
		);

		const pipeline = new Pipeline<number, Context, Global>()
			.pipe(fn1)
			.context(ctxFn)
			.pipe(fn);

		const result = pipeline.run(1, context, global);

		expect(result).toBe("2");

		expect(fn1).toHaveBeenCalledWith(1, context, global);
		expect(ctxFn).toHaveBeenCalledWith(2, context, global);
		expect(fn).toHaveBeenCalledWith(2, ctx, global);
	});

	test("can change the context (promise)", async () => {
		const ctx = "new context";
		const ctxFn: TestFn<number, Promise<string>> = jest.fn(async () => ctx);
		const fn: TypePipe.Function<number, string, string, Global> = jest.fn(x =>
			x.toString()
		);

		const pipeline = new Pipeline<number, Context, Global>()
			.pipe(fn1)
			.context(ctxFn)
			.pipe(fn);

		const result = await pipeline.run(1, context, global);

		expect(result).toBe("2");

		expect(fn1).toHaveBeenCalledWith(1, context, global);
		expect(ctxFn).toHaveBeenCalledWith(2, context, global);
		expect(fn).toHaveBeenCalledWith(2, ctx, global);
	});

	test("can pass an error handler", () => {
		const error = new Error();
		const fn: TestFn<number, number> = jest.fn(() => {
			throw error;
		});
		const expected = "Error";
		const catchError: TestFn<unknown, string> = jest.fn(() => expected);

		const pipeline = new Pipeline<number, Context, Global>()
			.pipe(fn)
			.catch(catchError);

		const result = pipeline.run(1, context, global);

		expect(result).toBe(expected);
		expect(catchError).toHaveBeenCalledWith(error, context, global);
	});

	test("throws original error if no error handler is provided", () => {
		const error = new Error();
		const badFn: TestFn<number, number> = jest.fn(() => {
			throw error;
		});

		const pipeline = new Pipeline<number, Context, Global>().pipe(badFn);

		const fn = () => pipeline.run(1, context, global);

		expect(fn).toThrowError(error);
	});

	test("can pass an error handler (promise)", async () => {
		const error = new Error();
		const fn: TestFn<number, Promise<number>> = jest.fn(async () => {
			throw error;
		});
		const expected = "Error";
		const catchError: TestFn<unknown, string> = jest.fn(() => expected);

		const pipeline = new Pipeline<number, Context, Global>()
			.pipe(fn)
			.catch(catchError);

		const result = await pipeline.run(1, context, global);

		expect(result).toBe(expected);
		expect(catchError).toHaveBeenCalledWith(error, context, global);
	});

	test("throws original error if no error handler is provided (promise)", () => {
		const error = new Error();
		const badFn: TestFn<number, Promise<number>> = jest.fn(async () => {
			throw error;
		});

		const pipeline = new Pipeline<number, Context, Global>().pipe(badFn);

		const result = pipeline.run(1, context, global);

		expect(result).rejects.toThrowError(error);
	});
});
