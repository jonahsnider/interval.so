import { Exception } from '@adonisjs/core/exceptions';
import { ExceptionHandler, type HttpContext } from '@adonisjs/core/http';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default class HttpExceptionHandler extends ExceptionHandler {
	/**
	 * In debug mode, the exception handler will display verbose errors
	 * with pretty printed stack traces.
	 */
	protected debug = false;

	/**
	 * The method is used for handling errors and returning
	 * response to the client
	 */
	handle(error: unknown, ctx: HttpContext) {
		if (error instanceof Exception && error.status >= 400 && error.status < 500) {
			// Only use default handler for client errors
			return super.handle(error, ctx);
		}

		// Server errors get a generic report
		return super.handle(new Exception('An internal server error occurred', { status: 500 }), ctx);
	}

	/**
	 * The method is used to report error to the logging service or
	 * the third party error monitoring service.
	 *
	 * @note You should not attempt to send a response from this method.
	 */
	report(error: unknown, ctx: HttpContext) {
		return super.report(error, ctx);
	}
}
