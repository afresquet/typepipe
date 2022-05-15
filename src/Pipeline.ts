import { isPromise } from "util/types";
import type { Pipeline as TPipeline } from "./types/pipeline";
import type { IsAsync, IsPromise, Persist } from "./types/types";

export default class Pipeline<Input, Current, Context, Global, Async = false>
	implements TPipeline.Pipeline<Input, Current, Context, Global, Async>
{
	functions: TPipeline.Fn<any, any, Context, Global>[] = [];

	pipe<Next, IsAsync = IsPromise<Next>>(
		fn: TPipeline.Fn<Current, Next, Context, Global>
	) {
		this.functions.push(fn);

		return this as unknown as Pipeline<
			Input,
			Awaited<Next>,
			Context,
			Global,
			Persist<Async, IsAsync>
		>;
	}

	compose(): TPipeline.Fn<
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
		) as TPipeline.Fn<Input, IsAsync<Current, Async, true>, Context, Global>;

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
}
