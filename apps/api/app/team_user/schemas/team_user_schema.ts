import { z } from 'zod';
import { type TeamUserRole, teamUserRole } from '#database/schema';
import { UserSchema } from '../../user/schemas/user_schema.js';

export const TeamUserSchema = z.object({
	id: z.string().uuid(),
	displayName: UserSchema.shape.displayName,
	role: z.enum(teamUserRole.enumValues),
});
export type TeamUserSchema = z.infer<typeof TeamUserSchema>;

export function rolesThatCanManageOther(other: Pick<TeamUserSchema, 'role'>): TeamUserRole[] {
	switch (other.role) {
		case 'owner':
		case 'admin':
			return ['owner'];
		case 'viewer':
		case 'editor':
			// Editors can't update viewers, even though they're a level above them
			return ['owner', 'admin'];
	}
}
