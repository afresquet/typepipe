import Match from "../../classes/Match";

export declare namespace TypePipe {
	/**
	 * Function that receives a Value, a Context
	 * and a Global as arguments and returns a Result.
	 */
	interface Function<Value, Result, Context, Global> {
		(value: Value, context: Context, global: Global): Result;
	}

	/**
	 * Function that receives a callback that takes a Match as the argument
	 * and sets its conditions.
	 *
	 * Match will receive Value, Context and Global, and should return Result.
	 */
	interface MatchFunction<
		Value,
		Result,
		Context,
		Global,
		Async = Result extends Promise<unknown> ? true : false,
		Expected = Awaited<Result>
	> {
		(m: Match<Value, Context, Global, Expected>): Match<
			Value,
			Context,
			Global,
			Result,
			Async
		>;
	}
}
