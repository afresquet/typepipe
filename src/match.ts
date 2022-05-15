import { isPromise } from "util/types";
import { Pipeline } from "./types/pipeline";
import { IsAsync, IsPromise, Persist } from "./types/types";

type ExtendsNever<T, U, V> = [T] extends [never] ? U : V;

type IsPromiseOR<T, U> = T extends PromiseLike<unknown>
	? true
	: U extends PromiseLike<unknown>
	? true
	: false;

interface Match<Value, Context, Global, Result = never, Async = false> {
	on<
		Next extends ExtendsNever<Result, any, Result | Promise<Result>>,
		Condition extends boolean | Promise<boolean>
	>(
		matcher: (value: Value, context: Context, global: Global) => Condition,
		pipeline: Pipeline.Fn<Value, Next, Context, Global>
	): Match<
		Value,
		Context,
		Global,
		ExtendsNever<Result, Awaited<Next>, Result>,
		Persist<Async, IsPromiseOR<Next, Condition>>
	>;

	otherwise<Next extends ExtendsNever<Result, any, Result | Promise<Result>>>(
		pipeline: Pipeline.Fn<Value, Next, Context, Global>
	): Match<
		Value,
		Context,
		Global,
		ExtendsNever<Result, Awaited<Next>, Result>,
		Persist<Async, IsPromise<Next>>
	>;

	run(value: Value, context: Context, global: Global): IsAsync<Result, Async>;
}

class MatchBuilder<Value, Context, Global, Result = never, Async = false>
	implements Match<Value, Context, Global, Result, Async>
{
	private matchers: {
		matcher: Pipeline.Fn<Value, boolean | Promise<boolean>, Context, Global>;
		pipeline: Pipeline.Fn<
			Value,
			ExtendsNever<Result, any, Result | Promise<Result>>,
			Context,
			Global
		>;
	}[] = [];

	private otherwisePipeline?: Pipeline.Fn<
		Value,
		ExtendsNever<Result, any, Result | Promise<Result>>,
		Context,
		Global
	>;

	on<
		Next extends ExtendsNever<Result, any, Result | Promise<Result>>,
		Condition extends boolean | Promise<boolean>
	>(
		matcher: Pipeline.Fn<Value, Condition, Context, Global>,
		pipeline: Pipeline.Fn<Value, Next, Context, Global>
	) {
		this.matchers.push({ matcher, pipeline });

		return this as unknown as Match<
			Value,
			Context,
			Global,
			ExtendsNever<Result, Awaited<Next>, Result>,
			Persist<Async, IsPromiseOR<Next, Condition>>
		>;
	}

	otherwise<Next extends ExtendsNever<Result, any, Result | Promise<Result>>>(
		pipeline: Pipeline.Fn<Value, Next, Context, Global>
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

	run(value: Value, context: Context, global: Global): IsAsync<Result, Async> {
		for (const { matcher, pipeline } of this.matchers) {
			const condition = matcher(value, context, global) && pipeline;

			if (isPromise(condition)) {
				return condition.then(c => {
					if (!c) {
						if (this.otherwisePipeline !== undefined) {
							return this.otherwisePipeline(value, context, global);
						}

						throw new Error(
							"Condition didn't match and no 'otherwise' pipeline was provided"
						);
					}

					return pipeline(value, context, global);
				}) as IsAsync<Result, Async>;
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
	}
}

export function match<
	Value,
	Result,
	Context,
	Global,
	Async,
	Expected = Awaited<Result>
>(
	matchFn: (
		m: Match<Value, Context, Global, Expected>
	) => Match<Value, Context, Global, Result, Async>
) {
	const builder = matchFn(new MatchBuilder<Value, Context, Global>());

	return builder.run.bind(builder) as Pipeline.Fn<
		Value,
		IsAsync<Result, Async, true>,
		Context,
		Global
	>;
}
