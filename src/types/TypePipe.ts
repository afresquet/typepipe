import type { ExtendsNever, Infer, IsAsync, IsPromise, Persist } from "./types";

export declare namespace TypePipe {
	interface Function<Value, Result, Context, Global> {
		(value: Value, context: Context, global: Global): Result;
	}

	class Pipeline<Current, Context, Global, Input = Current, Async = false> {
		pipe<Next, IsAsync = IsPromise<Next>>(
			fn: TypePipe.Function<Current, Next, Context, Global>
		): Pipeline<Awaited<Next>, Context, Global, Input, Persist<Async, IsAsync>>;

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

		/* ---------- Steps ---------- */

		assert<Thrown>(
			throwable: TypePipe.Function<Current, Thrown, Context, Global>
		): Pipeline<
			NonNullable<Current>,
			Context,
			Global,
			Input,
			Persist<Async, IsPromise<Thrown>>
		>;

		// TypeScript is happy when this decalaration is duplicated, idek anymore
		// TODO: maybe try to fix this
		ifelse<
			Condition extends boolean | Promise<boolean>,
			Then,
			Otherwise extends Infer<Then>
		>(
			condition: TypePipe.Function<Current, Condition, Context, Global>,
			then: TypePipe.Function<Current, Then, Context, Global>,
			otherwise: TypePipe.Function<Current, Otherwise, Context, Global>
		): Pipeline<
			Awaited<Then>,
			Context,
			Global,
			Input,
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
		ifelse<
			Condition extends boolean | Promise<boolean>,
			Then,
			Otherwise extends Infer<Then>
		>(
			condition: TypePipe.Function<Current, Condition, Context, Global>,
			then: TypePipe.Function<Current, Then, Context, Global>,
			otherwise: TypePipe.Function<Current, Otherwise, Context, Global>
		): Pipeline<
			Awaited<Then>,
			Context,
			Global,
			Input,
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

		match<Result, MatchAsync>(
			matchFn: TypePipe.MatchFunction<
				Current,
				Result,
				Context,
				Global,
				MatchAsync,
				Awaited<Result>
			>
		): Pipeline<
			Awaited<Result>,
			Context,
			Global,
			Input,
			Persist<Async, MatchAsync>
		>;

		pairwise<Next>(
			fn: TypePipe.Function<Current, Next, Context, Global>
		): Pipeline<
			[Current, Awaited<Next>],
			Context,
			Global,
			Input,
			Persist<Async, IsPromise<Next>>
		>;

		tap<Result extends void | Promise<void>>(
			fn: TypePipe.Function<Current, Result, Context, Global>
		): Pipeline<
			Current,
			Context,
			Global,
			Input,
			Persist<Async, IsPromise<Result>>
		>;
	}

	interface MatchFunction<
		Value,
		Result,
		Context,
		Global,
		Async = Result extends Promise<unknown> ? true : false,
		Expected = Awaited<Result>
	> {
		(m: TypePipe.Match<Value, Context, Global, Expected>): TypePipe.Match<
			Value,
			Context,
			Global,
			Result,
			Async
		>;
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
