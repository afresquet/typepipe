// Testing utilities

import { TypePipe } from "../types/TypePipe";

// Types

export type Context = { foo: string };

export type Global = { bar: string };

export type TestFn<
	T = number,
	R = number,
	C = Context,
	G = Global
> = TypePipe.Function<T, R, C, G>;

export type TestMatchFN<
	T = number,
	R = number,
	C = Context,
	G = Global
> = TypePipe.MatchFunction<T, R, C, G>;

// Default Variables

export const value = 10;

export const context: Context = { foo: "bar" };

export const global: Global = { bar: "foo" };
