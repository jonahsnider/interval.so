import { z } from 'zod';

export const TeamMemberSchema = z.object({
	id: z.string().uuid(),
	name: z
		.string()
		.trim()
		.min(1, { message: "Team member's name can't be empty" })
		.max(128, { message: "Team member's name can't be longer than 128 characters" }),
	archived: z.boolean(),
	signedInAt: z.date().optional(),
	lastSeenAt: z.optional(z.date().or(z.literal('now'))),
});
export type TeamMemberSchema = z.infer<typeof TeamMemberSchema>;

export const SimpleTeamMemberSchema = TeamMemberSchema.pick({ id: true, name: true, signedInAt: true });
export type SimpleTeamMemberSchema = z.infer<typeof SimpleTeamMemberSchema>;
