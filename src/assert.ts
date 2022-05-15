import { tap } from "./tap";
import type { Pipeline } from "./types/pipeline";

export function assert<Value, Context, Global>(
	throwable: Pipeline.Fn<Value, any, Context, Global>
) {
	return tap<Value, void, Context, Global>((value, context, global) => {
		if (value === undefined || value === null) {
			throw throwable(value as Value, context, global);
		}
	}) as unknown as Pipeline.Fn<Value, NonNullable<Value>, Context, Global>;
}
