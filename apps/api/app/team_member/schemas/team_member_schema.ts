import { z } from 'zod';

export const TeamMemberSchema = z.object({
	id: z.string().uuid(),
	name: z
		.string()
		.trim()
		.min(1, { message: "Team member's name can't be empty" })
		.max(128, { message: "Team member's name can't be longer than 128 characters" }),
	archived: z.boolean().default(false),
	atMeeting: z.boolean().default(false),
});
export type TeamMemberSchema = z.infer<typeof TeamMemberSchema>;
