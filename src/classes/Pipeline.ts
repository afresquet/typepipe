import { isPromise } from "util/types";
import { assert, ifelse, match, pairwise, tap } from "../steps";
import type { TypePipe } from "../types/TypePipe";
import type { Infer, IsAsync, IsPromise, Persist } from "../types/types";

export default class Pipeline<
	Current,
	Context,
	Global,
	Input = Current,
	Async = false
> implements TypePipe.Pipeline<Current, Context, Global, Input, Async>
{
	private functions: TypePipe.Function<any, any, Context, Global>[] = [];

	pipe<Next, IsAsync = IsPromise<Next>>(
		fn: TypePipe.Function<Current, Next, Context, Global>
	) {
		this.functions.push(fn);

		return this as unknown as Pipeline<
			Awaited<Next>,
			Context,
			Global,
			Input,
			Persist<Async, IsAsync>
		>;
	}

	compose(): TypePipe.Function<
		Input,
		IsAsync<Current, Async, true>,
		Context,
		Global
	> {
		const composition = this.functions.reduce(
			(fn1, fn2) => (value, context, global) => {
				const res = fn1(value, context, global);

				if (isPromise(res)) {
					return res.then(r => fn2(r, context, global));
				}

				return fn2(res, context, global);
			}
		);

		return (value, context, global) => composition(value, context, global);
	}

	run(
		value: Input,
		context: Context,
		global: Global
	): IsAsync<Current, Async, true> {
		const composition = this.compose();

		return composition(value, context, global);
	}

	/* ---------- Steps ---------- */

	assert<Thrown>(
		throwable: TypePipe.Function<Current, Thrown, Context, Global>
	) {
		this.pipe(assert(throwable));

		return this as unknown as Pipeline<
			NonNullable<Current>,
			Context,
			Global,
			Input,
			Persist<Async, IsPromise<Thrown>>
		>;
	}

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

		type AreFunctionsAsync = Condition extends PromiseLike<unknown>
			? true
			: Then extends PromiseLike<unknown>
			? true
			: Otherwise extends PromiseLike<unknown>
			? true
			: false;

		return this as unknown as Pipeline<
			Awaited<Then>,
			Context,
			Global,
			Input,
			Persist<Async, AreFunctionsAsync>
		>;
	}

	match<Result, MatchAsync>(
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
			Persist<Async, MatchAsync>
		>;
	}

	pairwise<Next>(fn: TypePipe.Function<Current, Next, Context, Global>) {
		this.pipe(pairwise(fn));

		return this as unknown as Pipeline<
			[Current, Awaited<Next>],
			Context,
			Global,
			Input,
			Persist<Async, IsPromise<Next>>
		>;
	}

	tap<Result extends void | Promise<void>>(
		fn: TypePipe.Function<Current, Result, Context, Global>
	) {
		this.pipe(tap(fn));

		return this as unknown as Pipeline<
			Current,
			Context,
			Global,
			Input,
			Persist<Async, IsPromise<Result>>
		>;
	}
}
