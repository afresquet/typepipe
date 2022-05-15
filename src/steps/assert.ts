import type { TypePipe } from "../types/TypePipe";
import { tap } from "./tap";

export function assert<Value, Context, Global, Thrown>(
	throwable: TypePipe.Function<Value, Thrown, Context, Global>
) {
	return tap<Value, void, Context, Global>((value, context, global) => {
		if (value === undefined || value === null) {
			throw throwable(value, context, global);
		}
	}) as unknown as TypePipe.Function<
		Value,
		Thrown extends PromiseLike<unknown>
			? Promise<NonNullable<Value>>
			: NonNullable<Value>,
		Context,
		Global
	>;
}
