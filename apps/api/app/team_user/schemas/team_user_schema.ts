import { z } from 'zod';
import { type TeamManagerRole, teamManagerRole } from '#database/schema';
import { UserSchema } from '../../user/schemas/user_schema.js';

export const TeamManagerSchema = z.object({
	id: z.string().uuid(),
	displayName: UserSchema.shape.displayName,
	role: z.enum(teamManagerRole.enumValues),
});
export type TeamManagerSchema = z.infer<typeof TeamManagerSchema>;

export function rolesThatCanManageOther(other: Pick<TeamManagerSchema, 'role'>): TeamManagerRole[] {
	switch (other.role) {
		case 'owner':
		case 'admin':
			return ['owner'];
		case 'editor':
			return ['owner', 'admin'];
	}
}
