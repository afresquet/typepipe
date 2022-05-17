export class RouteErrors {
	static Exit() {
		return new Error("Exit");
	}

	static MissingArguments() {
		return new Error("Missing arguments");
	}

	static NotFound() {
		return new Error("Not found");
	}

	static InternalError() {
		return new Error("Internal error");
	}
}
