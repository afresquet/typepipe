import type { TypePipe } from "../types/TypePipe";
import { tap } from "./tap";

/**
 * Creates a function that will assert that the given value
 * is not `undefined` or `null`.
 *
 * If the value is `undefined` or `null`,
 * it will throw the result of calling the given callback.
 *
 * If it's not, it will return the value it received.
 *
 * @example
 * ```ts
 * const fn = assert((value, context, global) => new Error("no value"));
 *
 * fn(1, context, global); // 1
 * fn(undefined, context, global); // Error: no value
 * fn(null, context, global); // Error: no value
 * ```
 */
export function assert<Value, Context, Global, Thrown>(
	throwable: TypePipe.Function<Value, Thrown, Context, Global>
) {
	return tap<Value, void, Context, Global>((value, context, global) => {
		if (value === undefined || value === null) {
			throw throwable(value, context, global);
		}
	}) as unknown as TypePipe.Function<
		Value,
		NonNullable<Value>,
		Context,
		Global
	>;
}
