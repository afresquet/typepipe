import {
	ExtendsNever,
	IsAsync,
	IsPromise,
	IsPromiseOR,
	Persist,
} from "./types";

export declare namespace TypePipe {
	interface Function<Value, Result, Context, Global> {
		(value: Value, context: Context, global: Global): Result;
	}

	class Pipeline<Input, Current, Context, Global, Async = false> {
		functions: Function<any, any, Context, Global>[];

		pipe<Next, IsAsync = IsPromise<Next>>(
			fn: Function<Current, Next, Context, Global>
		): Pipeline<Input, Next, Context, Global, Persist<Async, IsAsync>>;

		compose(): Function<Input, IsAsync<Current, Async, true>, Context, Global>;

		run(
			value: Input,
			context: Context,
			global: Global
		): IsAsync<Current, Async, true>;
	}

	class Match<Value, Context, Global, Result = never, Async = false> {
		on<
			Next extends ExtendsNever<Result, any, Result | Promise<Result>>,
			Condition extends boolean | Promise<boolean>
		>(
			matcher: (value: Value, context: Context, global: Global) => Condition,
			pipeline: TypePipe.Function<Value, Next, Context, Global>
		): Match<
			Value,
			Context,
			Global,
			ExtendsNever<Result, Awaited<Next>, Result>,
			Persist<Async, IsPromiseOR<Next, Condition>>
		>;

		otherwise<Next extends ExtendsNever<Result, any, Result | Promise<Result>>>(
			pipeline: TypePipe.Function<Value, Next, Context, Global>
		): Match<
			Value,
			Context,
			Global,
			ExtendsNever<Result, Awaited<Next>, Result>,
			Persist<Async, IsPromise<Next>>
		>;

		run(value: Value, context: Context, global: Global): IsAsync<Result, Async>;
	}
}
