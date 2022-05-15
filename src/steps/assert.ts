import type { TypePipe } from "../types/TypePipe";
import { tap } from "./tap";

export function assert<Value, Context, Global>(
	throwable: TypePipe.Function<Value, any, Context, Global>
) {
	return tap<Value, void, Context, Global>((value, context, global) => {
		if (value === undefined || value === null) {
			throw throwable(value as Value, context, global);
		}
	}) as unknown as TypePipe.Function<
		Value,
		NonNullable<Value>,
		Context,
		Global
	>;
}
