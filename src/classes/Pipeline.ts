import { isPromise } from "util/types";
import { assert, ifelse, match, pairwise, tap } from "../steps";
import type { TypePipe } from "../types/TypePipe";
import type {
	ExtendsNever,
	Infer,
	IsAsync,
	IsPromise,
	Persist,
} from "../types/types";
import ChangeContext from "./ChangeContext";

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

	pipe<Next, IsAsync = IsPromise<Next>>(
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

	context<Next, IsAsync = IsPromise<Next>>(
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
				const res = fn1(value, context, global);

				if (res instanceof ChangeContext) {
					const ctx = res.run();

					if (isPromise(ctx)) {
						return ctx.then(c => {
							return fn2(res.value, c as any, global);
						});
					}

					return fn2(res.value, ctx, global);
				}

				if (isPromise(res)) {
					return res.then(r => {
						return fn2(r, context, global);
					});
				}

				return fn2(res, context, global);
			}
		);

		return (value, context, global) => {
			const onError = (error: unknown) => {
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

	private errorHandler?: (
		error: unknown,
		context: ContextInput,
		global: Global
	) => void;

	catch<E>(
		errorHandler: (error: unknown, context: ContextInput, global: Global) => E
	) {
		this.errorHandler = errorHandler;

		return this as unknown as Pipeline<
			Current,
			Context,
			Global,
			Input,
			ContextInput,
			E,
			Async
		>;
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
			ContextInput,
			Err,
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
			ContextInput,
			Err,
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
			ContextInput,
			Err,
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
			ContextInput,
			Err,
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
			ContextInput,
			Err,
			Persist<Async, IsPromise<Result>>
		>;
	}
}
