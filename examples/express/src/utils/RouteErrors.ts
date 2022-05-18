export class RouteErrors {
	static Exit = class Exit extends Error {
		constructor() {
			super("Exit");
		}
	};

	static MissingArguments = class MissingArguments extends Error {
		constructor() {
			super("MissingArguments");
		}
	};

	static NotFound = class NotFound extends Error {
		constructor() {
			super("NotFound");
		}
	};

	static InternalError = class InternalError extends Error {
		constructor() {
			super("InternalError");
		}
	};
}
