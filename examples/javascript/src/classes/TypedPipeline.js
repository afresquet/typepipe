//@ts-check

const { Pipeline } = require("typepipe");

/** @extends { Pipeline<string, { foo: string }, { bar: string }> } */
class TypedPipeline extends Pipeline {}

module.exports = TypedPipeline;
