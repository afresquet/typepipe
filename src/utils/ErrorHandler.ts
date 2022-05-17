import { TypePipe } from "../types/TypePipe";

export default class ErrorHandler<Value, Next, Context, Global> {
	constructor(
		public value: Value,
		private fn: TypePipe.Function<Value, Next, Context, Global>
	) {}

	run(): TypePipe.Function<Value, Next, Context, Global> {
		return this.fn;
	}
}
