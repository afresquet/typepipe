import { isPromise } from "util/types";
import type { Pipeline } from "./types/pipeline";
import { IsAsync } from "./types/types";

export function pairwise<Value, Next, Context, Global>(
	fn: Pipeline.Fn<Value, Next, Context, Global>
) {
	return ((value: Value, context: Context, global: Global) => {
		const result = fn(value, context, global);

		if (isPromise(result)) {
			return result.then(r => [value, r]);
		}

		return [value, result];
	}) as Pipeline.Fn<Value, IsAsync<[Value, Next], Next>, Context, Global>;
}
