export class Errors {
	static Exit = class Exit extends Error {
		constructor() {
			super("Exit");
		}
	};
}
