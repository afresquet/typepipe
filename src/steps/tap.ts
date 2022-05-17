import type { TypePipe } from "../types/TypePipe";
import type { IsAsync } from "../types/types";
import { isPromise } from "../utils/isPromise";

/**
 * Creates a function that will run the given callback function with the arguments it receives.
 *
 * The return value of the callback function will be ignored,
 * and the function will return the value it received.
 *
 * If the callback returns a `Promise`,
 * the returned value will be wrapped in a `Promise`.
 *
 * @example
 * ```ts
 * const fn = tap((value, context, global) => value + 1);
 *
 * fn(1, context, global); // 1
 *
 * const asyncFn = tap(async x => x + 1);
 *
 * asyncFn(1, context, global); // Promise => 1
 * ```
 */
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
