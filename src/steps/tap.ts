import { isPromise } from "util/types";
import type { TypePipe } from "../types/TypePipe";
import type { IsAsync } from "../types/types";

export function tap<
	Value,
	Result extends void | Promise<void>,
	Context,
	Global
>(fn: TypePipe.Function<Value, Result, Context, Global>) {
	return ((value, context, global) => {
		const promise = fn(value, context, global);

		if (isPromise(promise)) {
			return promise.then(() => value);
		}

		return value;
	}) as TypePipe.Function<Value, IsAsync<Value, Result>, Context, Global>;
}
