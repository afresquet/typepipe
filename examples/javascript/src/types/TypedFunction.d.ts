import { TypePipe } from "../../../../dist";

export interface TypedFunction<Input = number, Result = number>
	extends TypePipe.Function<Input, Result, { foo: Input }, { bar: Result }> {}
