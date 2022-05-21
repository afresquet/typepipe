import Pipeline from ".";
import {
	Context,
	context,
	Global,
	global,
	TestFn,
	TestMatchFN,
	value,
} from "../../utils/tests";

describe("Pipeline class", () => {
	const fn1: TestFn = jest.fn(x => x + 1);
	const fn2: TestFn = jest.fn(x => x * 2);
	const fn3: TestFn<number, string> = jest.fn(x => x.toString());

	const pipeline = new Pipeline<number, Context, Global>()
		.pipe(fn1)
		.pipe(fn2)
		.pipe(fn3);

	const expected = "22";

	function expectFns() {
		expect(fn1).toHaveBeenCalledWith(10, context, global);
		expect(fn2).toHaveBeenCalledWith(11, context, global);
		expect(fn3).toHaveBeenCalledWith(22, context, global);
	}

	beforeEach(jest.clearAllMocks);

	test("executes functions in order and passes the contexts", () => {
		const actual = pipeline.run(value, context, global);

		expect(actual).toBe(expected);
		expectFns();
	});

	test("can be composed to a function", () => {
		const composition = pipeline.compose();

		const actual = composition(value, context, global);

		expect(actual).toBe(expected);
		expectFns();
	});

	test("can be nested", () => {
		const pipeline = new Pipeline<number, Context, Global>()
			.pipe(fn1)
			.pipe(new Pipeline<number, Context, Global>().pipe(fn2).compose())
			.pipe(fn3);

		const actual = pipeline.run(value, context, global);

		expect(actual).toBe(expected);
		expectFns();
	});

	test("works with promises", () => {
		const fn = jest.fn(async x => x * 2);

		const pipeline = new Pipeline<number, Context, Global>()
			.pipe(fn1)
			.pipe(fn)
			.pipe(fn3);

		const actual = pipeline.run(value, context, global);

		expect(actual).resolves.toBe(expected);
	});

	describe("context", () => {
		test("can change the context", () => {
			const pipeline = new Pipeline<number, Context, Global>()
				.context(fn1)
				.pipe(fn2 as unknown as TestFn<number, number, number>)
				.pipe(fn3 as unknown as TestFn<number, string, number>);

			const actual = pipeline.run(value, context, global);
			const expected = "20";
			const expectedContext = 11;

			expect(actual).toBe(expected);
			expect(fn1).toHaveBeenCalledWith(10, context, global);
			expect(fn2).toHaveBeenCalledWith(10, expectedContext, global);
			expect(fn3).toHaveBeenCalledWith(20, expectedContext, global);
		});

		test("can change the context (promise)", async () => {
			const ctxFn: TestFn<number, Promise<number>> = jest.fn(async x => x + 1);

			const pipeline = new Pipeline<number, Context, Global>()
				.context(ctxFn)
				.pipe(fn2 as unknown as TestFn<number, number, number>)
				.pipe(fn3 as unknown as TestFn<number, string, number>);

			const actual = await pipeline.run(value, context, global);
			const expected = "20";
			const expectedContext = 11;

			expect(actual).toBe(expected);
			expect(ctxFn).toHaveBeenCalledWith(10, context, global);
			expect(fn2).toHaveBeenCalledWith(10, expectedContext, global);
			expect(fn3).toHaveBeenCalledWith(20, expectedContext, global);
		});
	});

	describe("error handler", () => {
		const error = new Error();
		const badFn: TestFn<unknown, void> = jest.fn(() => {
			throw error;
		});
		const catchError: TestFn<unknown, unknown> = jest.fn(e => e);

		test("can pass an error handler", () => {
			const pipeline = new Pipeline<number, Context, Global>()
				.catch(catchError)
				.pipe(fn1)
				.pipe(fn2)
				.pipe(fn3)
				.pipe(badFn);

			const actual = pipeline.run(1, context, global);

			expect(actual).toBe(error);
			expect(catchError).toHaveBeenCalledWith(error, context, global);
		});

		describe("can pass multiple error handlers", () => {
			const expected1 = new Error("1");
			const catchError1: TestFn<unknown, Error> = jest.fn(() => expected1);
			const expected2 = new Error("2");
			const catchError2: TestFn<unknown, Error> = jest.fn(() => expected2);

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

			test("calls the first error handler", () => {
				const value = 4;

				const actual = pipeline.run(value, context, global);

				expect(actual).toBe(expected1);
				expect(eh1).toHaveBeenCalledWith(value, context, global);
				expect(catchError1).toHaveBeenCalledWith(error, context, global);
				expect(eh2).not.toHaveBeenCalled();
			});

			test("calls the second error handler", () => {
				const value = 20;

				const actual = pipeline.run(value, context, global);

				expect(actual).toBe(expected2);
				expect(eh1).toHaveBeenCalledWith(value, context, global);
				expect(catchError1).not.toHaveBeenCalled();
				expect(eh2).toHaveBeenCalledWith(40, context, global);
				expect(catchError2).toHaveBeenCalledWith(error, context, global);
			});

			test("returns value if no error occurs", () => {
				const value = 7;

				const actual = pipeline.run(value, context, global);
				const expected = "7";

				expect(actual).toBe(expected);
				expect(eh1).toHaveBeenCalledWith(value, context, global);
				expect(catchError1).not.toHaveBeenCalled();
				expect(eh2).toHaveBeenCalledWith(14, context, global);
				expect(catchError2).not.toHaveBeenCalled();
				expect(eh3).toHaveBeenCalledWith(value, context, global);
			});
		});

		describe("clears error handler before starting", () => {
			const fn: TestFn<number, number> = jest.fn(value => {
				if (value < 5) {
					throw error;
				}

				return value * 2;
			});
			const catchError: TestFn<unknown, unknown> = jest.fn(e => e);

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

			test("calls the error handler the first time", () => {
				const actual = pipeline(1, context, global);

				expect(actual).toBe(error);
				expect(catchError).toHaveBeenCalledWith(error, context, global);
			});

			test("does not call the error handler the second time", () => {
				const actual = () => pipeline(value, context, global);

				expect(actual).toThrow(error);
				expect(catchError).not.toHaveBeenCalled();
			});
		});

		test("throws original error if no error handler is provided", () => {
			const pipeline = new Pipeline<number, Context, Global>().pipe(badFn);

			const actual = () => pipeline.run(value, context, global);

			expect(actual).toThrowError(error);
		});

		describe("async cases", () => {
			const catchErrorAsync: TestFn<unknown, Promise<unknown>> = jest.fn(
				async e => e
			);

			test("can pass an error handler (async)", async () => {
				const pipeline = new Pipeline<number, Context, Global>()
					.catch(catchErrorAsync)
					.pipe(badFn);

				const result = await pipeline.run(value, context, global);

				expect(result).toBe(error);
				expect(catchErrorAsync).toHaveBeenCalledWith(error, context, global);
			});

			describe("can pass multiple error handlers (async)", () => {
				const expected1 = new Error("1");
				const catchError1: TestFn<unknown, Promise<Error>> = jest.fn(
					async () => expected1
				);
				const expected2 = new Error("2");
				const catchError2: TestFn<unknown, Promise<Error>> = jest.fn(
					async () => expected2
				);

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

				test("calls the first error handler (async)", () => {
					const value = 4;

					const actual = pipeline.run(value, context, global);

					expect(actual).resolves.toBe(expected1);
					expect(eh1).toHaveBeenCalledWith(value, context, global);
					expect(catchError1).toHaveBeenCalledWith(error, context, global);
					expect(eh2).not.toHaveBeenCalled();
				});

				test("calls the second error handler (async)", () => {
					const value = 20;

					const actual = pipeline.run(value, context, global);

					expect(actual).resolves.toBe(expected2);
					expect(eh1).toHaveBeenCalledWith(value, context, global);
					expect(catchError1).not.toHaveBeenCalled();
					expect(eh2).toHaveBeenCalledWith(40, context, global);
					expect(catchError2).toHaveBeenCalledWith(error, context, global);
				});

				test("returns value if no error occurs (async)", () => {
					const value = 7;

					const actual = pipeline.run(value, context, global);
					const expected = "7";

					expect(actual).toBe(expected);
					expect(eh1).toHaveBeenCalledWith(value, context, global);
					expect(catchError1).not.toHaveBeenCalled();
					expect(eh2).toHaveBeenCalledWith(14, context, global);
					expect(catchError2).not.toHaveBeenCalled();
					expect(eh3).toHaveBeenCalledWith(value, context, global);
				});
			});

			test("throws original error if no error handler is provided (async)", () => {
				const pipeline = new Pipeline<number, Context, Global>().pipe(
					async () => {
						throw error;
					}
				);

				const result = pipeline.run(1, context, global);

				expect(result).rejects.toThrowError(error);
			});
		});
	});

	test("works with steps", () => {
		const tap: TestFn<number, void> = jest.fn(() => {});
		const assert: TestFn<number, Error> = jest.fn(() => new Error());
		const ifelse: [
			TestFn<number, boolean>,
			TestFn<number, number>,
			TestFn<number, number>
		] = [
			jest.fn(value => value > 2),
			jest.fn(value => value / 2),
			jest.fn(value => value * 2),
		];
		const match: TestMatchFN<number, string> = jest.fn(m =>
			m
				.on(
					value => value === 2,
					() => "two"
				)
				.on(
					value => value === 3,
					() => "three"
				)
				.otherwise(() => "other")
		);

		const pipeline = new Pipeline<number, Context, Global>()
			.tap(tap)
			.assert(assert)
			.ifelse(...ifelse)
			.match(match)
			.pairwise(() => "result");

		expect(pipeline.run(value, context, global)).toStrictEqual([
			"other",
			"result",
		]);
		expect(pipeline.run(1, context, global)).toStrictEqual(["two", "result"]);
		expect(pipeline.run(6, context, global)).toStrictEqual(["three", "result"]);
	});
});
