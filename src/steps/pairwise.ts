import type { TypePipe } from "../types/TypePipe";
import type { IsAsync } from "../types/types";
import { isPromise } from "../utils/isPromise";

/**
 * Creates a function that will run the given callback function
 * with the arguments it receives.
 *
 * It will return an `array` with the value it received as the first element,
 * and the value returned from the callback function as the second element.
 *
 * If the callback returns a `Promise`,
 * the returned `array` will be wrapped in a `Promise`.
 *
 * @example
 * ```ts
 * const fn = pairwise((value, context, global) => value + 1);
 *
 * fn(1, context, global); // [1, 2]
 *
 * const asyncFn = pairwise(async x => x + 1);
 *
 * asyncFn(1, context, global); // Promise => [1, 2]
 * ```
 */
export function pairwise<Value, Next, Context, Global>(
	fn: TypePipe.Function<Value, Next, Context, Global>
) {
	return ((value: Value, context: Context, global: Global) => {
		const result = fn(value, context, global);

		if (isPromise(result)) {
			return result.then(r => [value, r]);
		}

		return [value, result];
	}) as TypePipe.Function<Value, IsAsync<[Value, Next], Next>, Context, Global>;
}
