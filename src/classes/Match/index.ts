import type { TypePipe } from "../../types/TypePipe";
import type {
	ExtendsNever,
	IsAsync,
	IsPromise,
	Persist,
} from "../../types/types";
import { isPromise } from "../../utils/isPromise";

/**
 * Stores conditions and callbacks to execute with the given values.
 */
export default class Match<
	Value,
	Context,
	Global,
	Result = never,
	Async = false
> {
	private matchers: {
		matcher: TypePipe.Function<Value, boolean, Context, Global>;
		pipeline: TypePipe.Function<
			Value,
			ExtendsNever<Result, any, Result | Promise<Result>>,
			Context,
			Global
		>;
	}[] = [];

	private otherwisePipeline?: TypePipe.Function<
		Value,
		ExtendsNever<Result, any, Result | Promise<Result>>,
		Context,
		Global
	>;

	/**
	 * Adds a condition and a callback that will be run if the condition matches.
	 *
	 * @example
	 * ```ts
	 * const match = new Match()
	 * 	.on(
	 * 		(value, context, global) => value > 5,
	 * 		(value, context, global) => value / 2
	 * 	)
	 * 	.on(
	 * 		(value, context, global) => value < 5,
	 * 		(value, context, global) => value * 2
	 * 	);
	 * ```
	 */
	on<Next extends ExtendsNever<Result, any, Result | Promise<Result>>>(
		matcher: TypePipe.Function<Value, boolean, Context, Global>,
		pipeline: TypePipe.Function<Value, Next, Context, Global>
	) {
		this.matchers.push({ matcher, pipeline });

		return this as unknown as Match<
			Value,
			Context,
			Global,
			ExtendsNever<Result, Awaited<Next>, Result>,
			Persist<Async, IsPromise<Next>>
		>;
	}

	/**
	 * Adds a callback that will be called if no conditions match.
	 *
	 * @example
	 * ```ts
	 * const match = new Match()
	 * 	.on(
	 * 		(value, context, global) => value > 5,
	 * 		(value, context, global) => value / 2
	 * 	)
	 * 	.otherwise((value, context, global) => value * 2);
	 * ```
	 */
	otherwise<Next extends ExtendsNever<Result, any, Result | Promise<Result>>>(
		pipeline: TypePipe.Function<Value, Next, Context, Global>
	) {
		this.otherwisePipeline = pipeline;

		return this as unknown as Match<
			Value,
			Context,
			Global,
			ExtendsNever<Result, Awaited<Next>, Result>,
			Persist<Async, IsPromise<Next>>
		>;
	}

	/**
	 * Creates a pipeline function that will run all the conditions with the given values
	 * and will return the result of the called callback.
	 *
	 * If any of the conditions or callbacks returns a `Promise`,
	 * the returned value will be wrapped in a `Promise`.
	 *
	 * @example
	 * ```ts
	 * const fn = new Match()
	 * 	.on(
	 * 		(value, context, global) => value > 5,
	 * 		(value, context, global) => value / 2
	 * 	)
	 * 	.on(
	 * 		(value, context, global) => value < 5,
	 * 		(value, context, global) => value * 2
	 * 	)
	 * 	.otherwise((value, context, global) => 0)
	 * 	.compose();
	 *
	 * fn(20, context, global); // 10
	 * fn(2, context, global); // 4
	 * fn(5, context, global); // 0
	 *
	 * const asyncFn = new Match()
	 * 	.on(
	 * 		(value, context, global) => value > 5,
	 * 		async (value, context, global) => value / 2
	 * 	)
	 * 	.on(
	 * 		async (value, context, global) => value < 5,
	 * 		(value, context, global) => value * 2
	 * 	)
	 * 	.otherwise((value, context, global) => 0)
	 * 	.compose();
	 *
	 * asyncFn(20, context, global); // Promise => 10
	 * asyncFn(2, context, global); // Promise => 4
	 * asyncFn(5, context, global); // Promise => 0
	 * ```
	 */
	compose() {
		return ((value, context, global) => {
			for (const { matcher, pipeline } of this.matchers) {
				const condition = matcher(value, context, global);

				if (isPromise(condition)) {
					throw new Error("Condition can't be a promise");
				}

				if (condition) {
					return pipeline(value, context, global) as IsAsync<Result, Async>;
				}
			}

			if (!this.otherwisePipeline) {
				throw new Error(
					"Condition didn't match and no 'otherwise' pipeline was provided"
				);
			}

			return this.otherwisePipeline(value, context, global) as IsAsync<
				Result,
				Async
			>;
		}) as TypePipe.Function<
			Value,
			IsAsync<Result, Async, true>,
			Context,
			Global
		>;
	}

	/**
	 * Calls the composed function from `Match.compose` with the given values
	 * and returns the result.
	 *
	 * @see Match#compose
	 *
	 * @example
	 * ```ts
	 * const match = new Match()
	 * 	.on(
	 * 		(value, context, global) => value > 5,
	 * 		(value, context, global) => value / 2
	 * 	)
	 * 	.on(
	 * 		(value, context, global) => value < 5,
	 * 		(value, context, global) => value * 2
	 * 	)
	 * 	.otherwise((value, context, global) => 0);
	 *
	 * match.run(20, context, global); // 10
	 * match.run(2, context, global); // 4
	 * match.run(5, context, global); // 0
	 *
	 * const asyncMatch = new Match()
	 * 	.on(
	 * 		(value, context, global) => value > 5,
	 * 		async (value, context, global) => value / 2
	 * 	)
	 * 	.on(
	 * 		async (value, context, global) => value < 5,
	 * 		(value, context, global) => value * 2
	 * 	)
	 * 	.otherwise((value, context, global) => 0);
	 *
	 * asyncMatch.run(20, context, global); // Promise => 10
	 * asyncMatch.run(2, context, global); // Promise => 4
	 * asyncMatch.run(5, context, global); // Promise => 0
	 * ```
	 */
	run(
		value: Value,
		context: Context,
		global: Global
	): IsAsync<Result, Async, true> {
		const composition = this.compose();

		return composition(value, context, global);
	}
}
