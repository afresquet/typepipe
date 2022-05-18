# `TypePipe` namespace

- [Function](#typepipefunction)
- [MatchFunction](#typepipematchfunction)

## TypePipe.Function

Function that receives a `Value`, a `Context` and a `Global` as arguments and returns a `Result`.

```ts
import { TypePipe } from "typepipe";

interface Context {
	foo: string;
}

interface Global {
	bar: string;
}

const fn: TypePipe.Function<number, string, Context, Global> = (
	value,
	context,
	global
) => {
	return number.toString();
};

fn(1, { foo: "bar" }, { bar: "baz" }); // "1"
fn("1", { foo: "bar" }, { bar: "baz" }); // TypeError
fn(1, "context", { bar: "baz" }); // TypeError
fn(1, { foo: "bar" }, "global"); // TypeError
```

## TypePipe.MatchFunction

Function that receives a callback that takes a [Match](../../classes/Match)

[Match](../../classes/Match)

```ts
import { TypePipe } from "typepipe";

interface Context {
	foo: string;
}

interface Global {
	bar: string;
}

const fn: TypePipe.MatchFunction<number, string, Context, Global> = match => {
	return match
		.on(
			(value, context, global) => value > 5,
			(value, context, global) => value.toString() + " is greater than 5"
		)
		.on(
			(value, context, global) => value < 5,
			(value, context, global) => value.toString() + " is less than 5"
		);
};

fn(10, { foo: "bar" }, { bar: "baz" }); // "100 is greater than 5"
fn(1, { foo: "bar" }, { bar: "baz" }); // "1 is less than 5"
fn("1", { foo: "bar" }, { bar: "baz" }); // TypeError
fn(1, "context", { bar: "baz" }); // TypeError
fn(1, { foo: "bar" }, "global"); // TypeError
```
