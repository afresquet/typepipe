// Types for tests

import { TypePipe } from "./TypePipe";

export type Context = { foo: string };

export type Global = { bar: string };

export type TestFn<T, R> = TypePipe.Function<T, R, Context, Global>;
