import Pipeline from ".";
import type { Context, Global, TestFn } from "../../types/tests";
import type { TypePipe } from "../../types/TypePipe";

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
			.catch(catchError)
			.pipe(fn);

		const result = pipeline.run(1, context, global);

		expect(result).toBe(expected);
		expect(catchError).toHaveBeenCalledWith(error, context, global);
	});

	test("can pass multiple error handlers", () => {
		const error = new Error();

		const expected1 = "Error1";
		const catchError1: TestFn<unknown, string> = jest.fn(() => expected1);
		const expected2 = ["Error2"];
		const catchError2: TestFn<unknown, string[]> = jest.fn(() => expected2);

		const eh1: TestFn<number, number> = jest.fn(value => {
			if (value < 5) {
				throw error;
			}

			return value * 2;
		});
		const eh2: TestFn<number, number> = jest.fn(value => {
			if (value > 15) {
				throw error;
			}

			return value / 2;
		});
		const eh3: TestFn<number, string> = jest.fn(value => value.toString());

		const pipeline = new Pipeline<number, Context, Global>()
			.catch(catchError1)
			.pipe(eh1)
			.catch(catchError2)
			.pipe(eh2)
			.pipe(eh3);

		const result1 = pipeline.run(4, context, global);

		expect(result1).toBe(expected1);
		expect(eh1).toHaveBeenCalledWith(4, context, global);
		expect(catchError1).toHaveBeenCalledWith(error, context, global);

		const result2 = pipeline.run(20, context, global);

		expect(result2).toBe(expected2);
		expect(eh2).toHaveBeenCalledWith(40, context, global);
		expect(catchError2).toHaveBeenCalledWith(error, context, global);

		const result3 = pipeline.run(7, context, global);

		expect(result3).toBe("7");
		expect(eh3).toHaveBeenCalledWith(7, context, global);
	});

	test("clears error handler before starting", () => {
		const error = new Error();
		const fn: TestFn<number, number> = jest.fn(value => {
			if (value < 5) {
				throw error;
			}

			return value * 2;
		});
		const expected = "Error";
		const catchError: TestFn<unknown, string> = jest.fn(() => expected);

		const pipeline = new Pipeline<number, Context, Global>()
			.pipe(value => {
				if (value > 5) {
					throw error;
				}

				return value;
			})
			.catch(catchError)
			.pipe(fn)
			.compose();

		const result = pipeline(1, context, global);

		expect(result).toBe(expected);
		expect(catchError).toHaveBeenCalledWith(error, context, global);

		expect(() => pipeline(10, context, global)).toThrow(error);
		expect(catchError).toHaveBeenCalledTimes(1);
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
			.catch(catchError)
			.pipe(fn);

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
