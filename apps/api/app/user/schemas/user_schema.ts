import { z } from 'zod';
import { TeamSchema } from '../../team/schemas/team_schema.js';

export const UserSchema = z.object({
	id: z.string().uuid(),
	displayName: z
		.string()
		.trim()
		.min(1, { message: "Display name can't be empty" })
		.max(128, { message: "Display name can't be longer than 128 characters" }),
	/** Teams this user is a manager of, keyed by team slug. */
	teams: z.record(TeamSchema.shape.slug, TeamSchema.pick({ slug: true, displayName: true })),
});
export type UserSchema = z.infer<typeof UserSchema>;
