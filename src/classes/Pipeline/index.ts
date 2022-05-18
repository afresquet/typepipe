import { assert, ifelse, match, pairwise, tap } from "../../steps";
import type { TypePipe } from "../../types/TypePipe";
import type {
	ExtendsNever,
	Infer,
	IsAsync,
	IsPromise,
	Persist,
} from "../../types/types";
import ChangeContext from "../../utils/ChangeContext";
import ErrorHandler from "../../utils/ErrorHandler";
import { isPromise } from "../../utils/isPromise";

/**
 * Pipes functions with the given value, context, and global context.
 */
export default class Pipeline<
	Current,
	Context,
	Global,
	Input = Current,
	ContextInput = Context,
	Err = never,
	Async = false
> {
	private functions: TypePipe.Function<any, any, Context, Global>[] = [];

	/**
	 * Adds a function to the pipeline,
	 * the value returned will be passed to the next piped function.
	 *
	 * @example
	 * ```ts
	 * const pipeline = new Pipeline()
	 * 	.pipe((value, context, global) => value + 1)
	 * 	.pipe((value, context, global) => value.toString())
	 * 	.pipe((value, context, global) => [value]);
	 * ```
	 */
	pipe<Next, IsAsync extends boolean = IsPromise<Next>>(
		fn: TypePipe.Function<Current, Next, Context, Global>
	) {
		this.functions.push(fn);

		return this as unknown as Pipeline<
			Awaited<Next>,
			Context,
			Global,
			Input,
			ContextInput,
			Err,
			Persist<Async, IsAsync>
		>;
	}

	/**
	 * Changes the context passed to the following functions of the pipeline.
	 *
	 * @example
	 * ```ts
	 * const pipeline = new Pipeline()
	 * 	.pipe((value, context, global) => value + 1) // context = "original context"
	 * 	.context((value, context, global) => context.split(" ")[1])
	 * 	.pipe((value, context, global) => context); // context = "context"
	 * ```
	 */
	context<Next, IsAsync extends boolean = IsPromise<Next>>(
		fn: TypePipe.Function<Current, Next, Context, Global>
	) {
		this.functions.push(
			(value, context, global) => new ChangeContext(value, context, global, fn)
		);

		return this as unknown as Pipeline<
			Current,
			Awaited<Next>,
			Global,
			Input,
			ContextInput,
			Err,
			Persist<Async, IsAsync>
		>;
	}

	private errorHandler?: (
		error: unknown,
		context: ContextInput,
		global: Global
	) => void;

	/**
	 * Adds an error handler that will be run if any of the piped functions fail.
	 *
	 * By default there's no error handler and any errors will be thrown.
	 *
	 * If this method is called more than once, the newest one will override the last one.
	 *
	 * This method should be called before piping any functions that you want to handle errors for.
	 *
	 * @example
	 * ```ts
	 * const pipeline = new Pipeline()
	 *  .catch((error, context, global) => console.log(error)) // Will log Syntax Error
	 * 	.pipe((value, context, global) => value + 1)
	 * 	.pipe((value, context, global) => value.bad_parameter) // Will throw error
	 * 	.pipe((value, context, global) => [value]);
	 *
	 * const pipeline2 = new Pipeline()
	 * 	.catch((error, context, global) => console.log("Error Handler 1"))
	 * 	.tap((value, context, global) => {
	 * 		if (value > 10) throw new Error("Value is too high");
	 * 	})
	 * 	.catch((error, context, global) => console.log("Error Handler 2"))
	 * 	.tap((value, context, global) => {
	 * 		if (value < 5) throw new Error("Value is too low");
	 * 	});
	 *
	 * pipeline2.run(15, context, global); // Returns nothing | Console log: Error Handler 1
	 * pipeline2.run(1, context, global); // Returns nothing | Console log: Error Handler 2
	 * pipeline2.run(7, context, global); // Returns 7
	 * ```
	 */
	catch<E>(
		errorHandler: (error: unknown, context: Context, global: Global) => E
	) {
		this.functions.push(value => new ErrorHandler(value, errorHandler));

		return this as unknown as Pipeline<
			Current,
			Context,
			Global,
			Input,
			ContextInput,
			ExtendsNever<Err, E, Err | E>,
			Async
		>;
	}

	/**
	 * Creates a function that will run all the piped functions in order.
	 *
	 * The first function will receive the given values,the subsequent functions
	 * will receive the value returned from the previous function and the contexts.
	 *
	 * If any of the functions returns a Promise,
	 * the returned value will be wrapped in a Promise.
	 *
	 * @example
	 * ```ts
	 * const fn = new Pipeline()
	 * 	.pipe((value, context, global) => value + 1)
	 * 	.pipe((value, context, global) => value.toString())
	 * 	.pipe((value, context, global) => [value])
	 * 	.compose();
	 *
	 * fn(1, context, global); ["2"]
	 * fn(5, context, global); // ["6"]
	 *
	 * const asyncFn = new Pipeline()
	 * 	.pipe((value, context, global) => value + 1)
	 * 	.pipe((value, context, global) => value.toString())
	 * 	.pipe((value, context, global) => [value])
	 * 	.compose();
	 *
	 * asyncFn(1, context, global); // Promise => ["2"]
	 * asyncFn(5, context, global); // Promise => ["6"]
	 */
	compose(): TypePipe.Function<
		Input,
		IsAsync<
			ExtendsNever<Err, Current, Err extends void ? Current : Current | Err>,
			Async,
			true
		>,
		ContextInput,
		Global
	> {
		const composition = this.functions.reduce(
			(fn1, fn2) => (value, context, global) => {
				const handleResult = (res: any) => {
					if (res instanceof ChangeContext) {
						const context = res.run();

						if (isPromise(context)) {
							return context.then(c => {
								return fn2(res.value, c as any, global);
							});
						}

						return fn2(res.value, context, global);
					}

					if (res instanceof ErrorHandler) {
						const errorHandler = res.run();

						this.errorHandler = errorHandler;

						return fn2(res.value, context, global);
					}

					return fn2(res, context, global);
				};

				const result = fn1(value, context, global);

				if (isPromise(result)) {
					return result.then(handleResult);
				}

				return handleResult(result);
			}
		);

		return (value, context, global) => {
			// Reset the error handler
			this.errorHandler = undefined;

			const onError = (error: unknown) => {
				console.log(this.errorHandler);
				if (!this.errorHandler) {
					throw error;
				}

				return this.errorHandler(error, context, global);
			};

			try {
				const result = composition(value, context as any, global);

				if (isPromise(result)) {
					return result.catch(onError);
				}

				return result;
			} catch (error) {
				return onError(error);
			}
		};
	}

	/**
	 * Calls the composed function from `Pipeline.compose` with the given values
	 * and returns the result.
	 *
	 * @see Pipeline#compose
	 *
	 * @example
	 * ```ts
	 * const pipeline = new Pipeline()
	 * 	.pipe((value, context, global) => value + 1)
	 * 	.pipe((value, context, global) => value.toString())
	 * 	.pipe((value, context, global) => [value])
	 * 	.compose();
	 *
	 * pipeline.run(1, context, global); ["2"]
	 * pipeline.run(5, context, global); // ["6"]
	 *
	 * const asyncPipeline = new Pipeline()
	 * 	.pipe((value, context, global) => value + 1)
	 * 	.pipe((value, context, global) => value.toString())
	 * 	.pipe((value, context, global) => [value])
	 * 	.compose();
	 *
	 * asyncPipeline.run(1, context, global); // Promise => ["2"]
	 * asyncPipeline.run(5, context, global); // Promise => ["6"]
	 */
	run(
		value: Input,
		context: ContextInput,
		global: Global
	): IsAsync<
		ExtendsNever<Err, Current, Err extends void ? Current : Current | Err>,
		Async,
		true
	> {
		const composition = this.compose();

		return composition(value, context, global);
	}

	/* ---------- Steps ---------- */

	/**
	 * Adds an `assert` step to the pipeline.
	 *
	 * @see {@link assert}
	 */
	assert<Thrown>(
		throwable: TypePipe.Function<Current, Thrown, Context, Global>
	) {
		this.pipe(assert(throwable));

		return this as unknown as Pipeline<
			NonNullable<Current>,
			Context,
			Global,
			Input,
			ContextInput,
			Err,
			Persist<Async, IsPromise<Thrown>>
		>;
	}

	/**
	 * Adds an `ifelse` step to the pipeline.
	 *
	 * @see {@link ifelse}
	 */
	ifelse<
		Condition extends boolean | Promise<boolean>,
		Then,
		Otherwise extends Infer<Then>
	>(
		condition: TypePipe.Function<Current, Condition, Context, Global>,
		then: TypePipe.Function<Current, Then, Context, Global>,
		otherwise: TypePipe.Function<Current, Otherwise, Context, Global>
	) {
		this.pipe(ifelse(condition, then, otherwise));

		return this as unknown as Pipeline<
			Awaited<Then>,
			Context,
			Global,
			Input,
			ContextInput,
			Err,
			Persist<
				Async,
				Condition extends PromiseLike<unknown>
					? true
					: Then extends PromiseLike<unknown>
					? true
					: Otherwise extends PromiseLike<unknown>
					? true
					: false
			>
		>;
	}

	/**
	 * Adds a `match` step to the pipeline.
	 *
	 * @see {@link match}
	 */
	match<Result, MatchAsync extends boolean>(
		matchFn: TypePipe.MatchFunction<
			Current,
			Result,
			Context,
			Global,
			MatchAsync,
			Awaited<Result>
		>
	) {
		this.pipe(match(matchFn));

		return this as unknown as Pipeline<
			Awaited<Result>,
			Context,
			Global,
			Input,
			ContextInput,
			Err,
			Persist<Async, MatchAsync>
		>;
	}

	/**
	 * Adds a `pairwise` step to the pipeline.
	 *
	 * @see {@link pairwise}
	 */
	pairwise<Next>(fn: TypePipe.Function<Current, Next, Context, Global>) {
		this.pipe(pairwise(fn));

		return this as unknown as Pipeline<
			[Current, Awaited<Next>],
			Context,
			Global,
			Input,
			ContextInput,
			Err,
			Persist<Async, IsPromise<Next>>
		>;
	}

	/**
	 * Adds a `tap` step to the pipeline.
	 *
	 * @see {@link tap}
	 */
	tap<Result extends void | Promise<void>>(
		fn: TypePipe.Function<Current, Result, Context, Global>
	) {
		this.pipe(tap(fn));

		return this as unknown as Pipeline<
			Current,
			Context,
			Global,
			Input,
			ContextInput,
			Err,
			Persist<Async, IsPromise<Result>>
		>;
	}
}
