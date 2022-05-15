import { ExtendsNever, IsAsync, IsPromise, Persist } from "./types";

export declare namespace TypePipe {
	interface Function<Value, Result, Context, Global> {
		(value: Value, context: Context, global: Global): Result;
	}

	class Pipeline<Input, Current, Context, Global, Async = false> {
		pipe<Next, IsAsync = IsPromise<Next>>(
			fn: TypePipe.Function<Current, Next, Context, Global>
		): Pipeline<Input, Next, Context, Global, Persist<Async, IsAsync>>;

		compose(): TypePipe.Function<
			Input,
			IsAsync<Current, Async, true>,
			Context,
			Global
		>;

		run(
			value: Input,
			context: Context,
			global: Global
		): IsAsync<Current, Async, true>;
	}

	class Match<Value, Context, Global, Result = never, Async = false> {
		on<Next extends ExtendsNever<Result, any, Result | Promise<Result>>>(
			matcher: (value: Value, context: Context, global: Global) => boolean,
			pipeline: TypePipe.Function<Value, Next, Context, Global>
		): Match<
			Value,
			Context,
			Global,
			ExtendsNever<Result, Awaited<Next>, Result>,
			Persist<Async, IsPromise<Next>>
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

		compose(): TypePipe.Function<
			Value,
			IsAsync<Result, Async, true>,
			Context,
			Global
		>;

		run(
			value: Value,
			context: Context,
			global: Global
		): IsAsync<Result, Async, true>;
	}
}
