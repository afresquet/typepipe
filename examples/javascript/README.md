# JavaScript Example

TypePipe works on JavaScript with some help from VS Code and JSDoc.

First, we need to enable `//@ts-check` at the beginning of the file, or you could enable that for your workspace or globally on VS Code.

```js
//@ts-check

const { Pipeline } = require("typepipe");

/* ... */
```

Then, we have to assign a Pipeline to a variable before using it, otherwise we would be assigning a type to the result of the pipeline.

```js
const pipeline = new Pipeline();

pipeline
	.pipe(/* ... */)
	.pipe(/* ... */)
	.pipe(/* ... */)
	.pipe(/* ... */)
	.pipe(/* ... */);
```

This way we can annotate its `@type` with JSDoc.

```js
/** @type { Pipeline<number, { foo: string }, { bar: boolean }> } */
const pipeline = new Pipeline();
```

Now it works! You'll get type checking all the way.

But this isn't very reusable, as we don't want to repeat this JSDoc for every pipeline.

Luckily, we can use `@extends` to solve this problem.

```js
//@ts-check

const { Pipeline } = require("typepipe");

/** @extends { Pipeline<number, { foo: string }, { bar: boolean }> } */
class TypedPipeline extends Pipeline {}

module.exports = TypedPipeline;
```

We can now import `TypedPipeline` elsewhere in our code and we'll get the same type checking without the need of declaring JSDoc everytime.

For functions, we need to create the `interface` in a `.d.ts` file.

```ts
// index.d.ts

import { TypePipe } from "typepipe";

interface Context {
	foo: string;
}

interface Global {
	bar: boolean;
}

export interface TypedFunction<Input = number, Output = number>
	extends TypePipe.Function<Input, Output, Context, Global> {}
```

When making a function we can annotate its type with JSDoc.

```js
//@ts-check

/** @type { import("./index").TypedFunction<number, number> } */
const addIfBar = (value, context, global) => {
	if (global.bar) {
		return value + context.foo;
	}

	return value;
};
```
