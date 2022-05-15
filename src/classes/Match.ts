import { isPromise } from "util/types";
import type { TypePipe } from "../types/TypePipe";
import type {
	ExtendsNever,
	IsAsync,
	IsPromise,
	IsPromiseOR,
	Persist,
} from "../types/types";

export default class Match<
	Value,
	Context,
	Global,
	Result = never,
	Async = false
> implements TypePipe.Match<Value, Context, Global, Result, Async>
{
	private matchers: {
		matcher: TypePipe.Function<
			Value,
			boolean | Promise<boolean>,
			Context,
			Global
		>;
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

	on<
		Next extends ExtendsNever<Result, any, Result | Promise<Result>>,
		Condition extends boolean | Promise<boolean>
	>(
		matcher: TypePipe.Function<Value, Condition, Context, Global>,
		pipeline: TypePipe.Function<Value, Next, Context, Global>
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
