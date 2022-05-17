import type { TypePipe } from "../types/TypePipe";
import { Infer } from "../types/types";
import { isPromise } from "../utils/isPromise";

/**
 * Creates a function that will call a `condition` callback,
 * if it returns `true` it will run the `then` callback,
 * if it returns `false` it will run the `otherwise` callback.
 *
 * Returns the value of either `then` or `otherwise` callbacks,
 * depending on which one was called.
 *
 * If any of the three callbacks it receives returns a `Promise`,
 * the returned value will be wrapped in a `Promise`.
 *
 * @example
 * ```ts
 * const fn = ifelse(
 * 	 (value, context, global) => value > 5,
 * 	 (value, context, global) => value / 2,
 * 	 (value, context, global) => value * 2
 * );
 *
 * fn(20, context, global); // 10
 * fn(2, context, global); // 4
 *
 * const asyncFn = ifelse(
 * 	async (value, context, global) => value > 5,
 * 	(value, context, global) => value / 2,
 * 	(value, context, global) => value * 2
 * );
 *
 * asyncFn(20, context, global); // Promise => 10
 * asyncFn(2, context, global); // Promise => 4
 * ```
 */
export function ifelse<
	Value,
	Condition extends boolean | Promise<boolean>,
	Then,
	Otherwise extends Infer<Then>,
	Context,
	Global
>(
	condition: TypePipe.Function<Value, Condition, Context, Global>,
	then: TypePipe.Function<Value, Then, Context, Global>,
	otherwise: TypePipe.Function<Value, Otherwise, Context, Global>
) {
	return ((...args) => {
		const result = condition(...args);

		if (isPromise(result)) {
			return result.then(b => (b ? then(...args) : otherwise(...args)));
		}

		return result ? then(...args) : otherwise(...args);
	}) as TypePipe.Function<Value, Awaited<Then>, Context, Global>;
}
