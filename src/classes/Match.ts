import { isPromise } from "util/types";
import type { TypePipe } from "../types/TypePipe";
import type { ExtendsNever, IsAsync, IsPromise, Persist } from "../types/types";

export default class Match<
	Value,
	Context,
	Global,
	Result = never,
	Async = false
> implements TypePipe.Match<Value, Context, Global, Result, Async>
{
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

	run(
		value: Value,
		context: Context,
		global: Global
	): IsAsync<Result, Async, true> {
		const composition = this.compose();

		return composition(value, context, global);
	}
}
