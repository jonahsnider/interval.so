import { P, match } from 'ts-pattern';
import { z } from 'zod';
import type { TeamManagerRole } from '#database/schema';
import { UserSchema } from '../../user/schemas/user_schema.js';

export const TeamManagerSchema = z.object({
	user: UserSchema,
	role: z.enum(['owner', 'admin', 'editor']),
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

/** Given the roles for an actor and their target, return the roles that they can set the target to have.*/
export function getAllowedRoleModifications(
	actor: Pick<TeamManagerSchema, 'role'>,
	target: Pick<TeamManagerSchema, 'role'>,
): TeamManagerRole[] {
	return (
		match({
			mine: actor.role,
			theirs: target.role,
		})
			// Owner can't modify themself since they're a special case
			.with({ mine: 'owner', theirs: 'owner' }, (): TeamManagerRole[] => [])
			.with({ mine: 'owner', theirs: P.union('admin', 'editor') }, (): TeamManagerRole[] => [
				'owner',
				'admin',
				'editor',
			])

			// Editors can't modify anyone
			.with({ mine: 'editor', theirs: P.any }, (): TeamManagerRole[] => [])

			// Admins can modify editors to stay as editors
			.with({ mine: 'admin', theirs: 'editor' }, (): TeamManagerRole[] => ['editor'])
			// Admins can't modify owners or other admins
			.with({ mine: 'admin', theirs: P.union('owner', 'admin') }, (): TeamManagerRole[] => [])
			.exhaustive()
	);
}
