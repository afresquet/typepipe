export default class ChangeContext<Value, Previous, Next, Global> {
	constructor(
		public value: Value,
		private context: Previous,
		private global: Global,
		private fn: (value: Value, context: Previous, global: Global) => Next
	) {}

	run(): Next {
		return this.fn(this.value, this.context, this.global);
	}
}
