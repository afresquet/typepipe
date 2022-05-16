import Match from "../classes/Match";

export declare namespace TypePipe {
	interface Function<Value, Result, Context, Global> {
		(value: Value, context: Context, global: Global): Result;
	}

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
