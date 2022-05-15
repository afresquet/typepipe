import { isPromise } from "util/types";
import type { Pipeline } from "./types/pipeline";
import { IsAsync } from "./types/types";

export function tap<
	Value,
	Result extends void | Promise<void>,
	Context,
	Global
>(fn: Pipeline.Fn<Value, Result, Context, Global>) {
	return ((value, context, global) => {
		const promise = fn(value, context, global);

		if (isPromise(promise)) {
			return promise.then(() => value);
		}

		return value;
	}) as Pipeline.Fn<Value, IsAsync<Value, Result>, Context, Global>;
}
