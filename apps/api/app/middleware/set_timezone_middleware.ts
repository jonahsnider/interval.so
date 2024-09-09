import type { HttpContext } from '@adonisjs/core/http';
import type { NextFn } from '@adonisjs/core/types/http';
import { UserTimezoneSchema } from '../user/schemas/user_timezone_schema.js';

/**
 * Users can include a "X-Set-Timezone" header in their request to set their timezone. This allows clients to set the timezone automatically & without prompting the user.
 */
// biome-ignore lint/style/noDefaultExport: This must be a default export
export default class SetTimezoneMiddleware {
	handle(ctx: HttpContext, next: NextFn) {
		const setTimezoneHeader = ctx.request.header('x-set-timezone');

		// We only want to store the timezone once the user has authenticated, not on every request (ex. subscribing to team events)
		if (setTimezoneHeader && ctx.session.has('userId')) {
			const timezone = UserTimezoneSchema.safeParse(setTimezoneHeader);

			if (timezone.success) {
				ctx.session.put('timezone', timezone.data);
			}
		}

		return next();
	}
}
