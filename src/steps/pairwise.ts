import type { TypePipe } from "../types/TypePipe";
import type { IsAsync } from "../types/types";
import { isPromise } from "../utils/isPromise";

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
