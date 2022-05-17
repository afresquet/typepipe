# TypePipe

A library to create pipelines with contexts and strong type checking.

## Installation

With [Node.js and npm](https://nodejs.org/) installed in your computer run:

```bash
npm install typepipe
```

## Documentation

- [Classes](./src/classes/README.md#classes)
  - [Pipeline](./src/classes/Pipeline/README.md#pipeline)
  - [Match](./src/classes/Match/README.md#match)
- [Steps](./src/steps/README.md#steps)
  - [assert](./src/steps/README.md#assert)
  - [ifelse](./src/steps/README.md#ifelse)
  - [match](./src/steps/README.md#match)
  - [pairwise](./src/steps/README.md#pairwise)
  - [tap](./src/steps/README.md#tap)

## Usage

JavaScript:

```js
const { Pipeline } = require("typepipe");

const pipeline = new Pipeline()
	.pipe((value, context, global) => global.effect(value, context.foo))
	.pipe((value, context, global) => value.toString())
	.pipe((value, context, global) => string.padStart(2, "0"));

pipeline.run(1, { foo: 2 }, { effect: (a, b) => a + b }); // "03"

const fn = pipeline.compose();

fn(5, { foo: 4 }, { effect: (a, b) => a - b }); // "01"
```

TypeScript:

```ts
import { Pipeline } from "typepipe";

interface Context {
	foo: number;
}

interface Global {
	effect: (a: number, b: number) => number;
}

const pipeline = new Pipeline<number, Context, Global>()
	.pipe((value, { foo }, { effect }) => effect(value, foo))
	.pipe((value, context, global) => value.toString())
	.pipe((value, context, global) => string.padStart(2, "0")); // TypeScript knows `value` is a string now

pipeline.run(1, { foo: 2 }, { effect: (a, b) => a + b }); // "03"
pipeline.run("1", { foo: 2 }, { effect: (a, b) => a + b }); // Type Error: value should be a number
pipeline.run(1, "context", { effect: (a, b) => a + b }); // Type Error: context should be type Context

const fn = pipeline.compose();

fn(5, { foo: 4 }, { effect: (a, b) => a - b }); // "01"
fn("5", { foo: 4 }, { effect: (a, b) => a + b }); // Type Error: value should be a number
fn(5, { foo: 4 }, "global"); // Type Error: global should be type Global
```

## Context and Global

As you can see in the examples above, the functions have two other parameters: `context` and `global`.

You can use them for anything you want really, but the idea is that `context` is something (often an object) containing relevant values for the current execution, and `global` has constant values that are shared between all executions.

For example, you could use this on an [Express.js](https://github.com/expressjs/express) server (or any other server library/framework), and have the `context` be the current `req` and `res` objects, and `global` could be database models and/or libraries.

This makes unit testing really easy, as you can mock both those contexts very easily.

Another example could be a chatbot, where you have `context` containing data about the new message, and `global` containing the data about the whole conversation.

This is useful in anything that gets executed multiple times with different inputs, and has to be processed the same way.

## Type Checking

This library was created with type checking as the first priority.

While you can still use it in JavaScript just fine, you will find that it is so much more powerful in TypeScript.

You should only need to fill in the generics of `Pipeline` when instanciating it. Then everything will get inferred automatically, step by step, no matter how many funtions you pipe in.

But if you want to extract the functions you pass to your pipelines (and you should in order to unit test them), you can give them a type `TypePipe.Function` and pass your generics to the type like this:

```ts
import { TypePipe } from "typepipe";
import { MyContext, MyGlobal } from "../types";

export const concatenateContexts: TypePipe.Function<
	string,
	string,
	MyContext,
	MyGlobal
> = (value, context, global) => {
	return value + context + global;
};
```

As you can imagine, this can become very repetitive as you use the library more and more. Not only you would need to pass your `Context` and `Global` generics to each `TypePipe.Function`, but you would also need to pass them to each `Pipeline` you create.

And what happens if at some point you want to change the generics? It would be better if we could have a centralized place where to control all of this.

Luckily this is very simple to solve. For `Pipeline` it would be as easy as extending from it and passing the generics to the extends declaration. And for `TypePipe.Function` it's not any different, we can make an `interface` that extends from it, again passing the generics to the extends declaration. We can even keep the input value generic and give it a default type.

```ts
import { Pipeline, TypePipe } from "typepipe";
import { MyContext, MyGlobal } from "../types";

export default class MyPipeline<Input = string> extends Pipeline<
	Input,
	MyContext,
	MyGlobal
> {}

export interface MyFunction<Input = string, Output = string>
	extends TypePipe.Function<Input, Output, MyContext, MyGlobal> {}
```

That's it! Now we can use `MyPipeline` and `MyFunction` and we can forget about passing the `MyContext` and `MyGlobal` generics to each `Pipeline` and `TypePipe.Function` we create.

```ts
import MyPipeline, { MyFunction } from "./MyPipeline";

const concatenateContexts: MyFunction = (value, context, global) => {
	return value + context + global;
};

const pipeline = new MyPipeline().pipe(concatenateContexts);

const numberToString: MyFunction<number, string> = (value, context, global) => {
	return value.toString();
};

const pipelineNumber = new MyPipeline<number>().pipe(numberToString);
```

## Contribute

1. Fork the repository and clone it to your computer.
2. Create a branch: `git checkout -b my-new-feature`
3. Install dependencies: `npm install`
4. Commit your changes: `git commit -am "Add some feature"`
5. Push to the branch: `git push origin my-new-feature`
6. Open a pull request :D
