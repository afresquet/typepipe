import { isPromise } from "util/types";
import type { Pipeline } from "./types/pipeline";
import { IsAsync } from "./types/types";

export function ifelse<
	Value,
	Condition extends boolean | Promise<boolean>,
	Then,
	Otherwise extends Then extends PromiseLike<infer U>
		? U | Promise<U>
		: Then | Promise<Then>,
	Context,
	Global
>(
	condition: Pipeline.Fn<Value, Condition, Context, Global>,
	then: Pipeline.Fn<Value, Then, Context, Global>,
	otherwise: Pipeline.Fn<Value, Otherwise, Context, Global> = value =>
		value as any
) {
	type Next = Then extends PromiseLike<unknown> ? Then : Otherwise;

	return ((...args) => {
		const result = condition(...args);

		if (isPromise(result)) {
			return result.then(b => (b ? then(...args) : otherwise(...args)));
		}

		return result ? then(...args) : otherwise(...args);
	}) as Pipeline.Fn<
		Value,
		Next extends PromiseLike<unknown> ? Next : IsAsync<Next, Condition>,
		Context,
		Global
	>;
}
