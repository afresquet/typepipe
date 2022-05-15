import { IsAsync, IsPromise, Persist } from "./types";

export declare namespace Pipeline {
	interface Fn<Value, Result, Context, Global> {
		(value: Value, context: Context, global: Global): Result;
	}

	class Pipeline<Input, Current, Context, Global, Async = false> {
		functions: Fn<any, any, Context, Global>[];

		pipe<Next, IsAsync = IsPromise<Next>>(
			fn: Fn<Current, Next, Context, Global>
		): Pipeline<Input, Next, Context, Global, Persist<Async, IsAsync>>;

		compose(): Fn<Input, IsAsync<Current, Async, true>, Context, Global>;

		run(
			value: Input,
			context: Context,
			global: Global
		): IsAsync<Current, Async, true>;
	}
}
