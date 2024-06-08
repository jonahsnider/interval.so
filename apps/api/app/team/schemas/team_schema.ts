import { z } from 'zod';

export const TeamSchema = z.object({
	slug: z
		.string()
		.trim()
		.min(1, { message: "Team URLs can't be empty" })
		.max(64, { message: "Team URLs can't be longer than 64 characters" })
		.regex(/^[a-z0-9-]+$/, { message: 'Team URLs can only contain lowercase letters, numbers, and hyphens' }),
	displayName: z
		.string()
		.trim()
		.min(1, { message: "Team display names can't be empty" })
		.max(64, { message: "Team display names can't be longer than 64 characters" }),
	password: z
		.string()
		.min(1, { message: "Team passwords can't be empty" })
		.max(64, { message: "Team passwords can't be longer than 64 characters" }),
});
export type TeamSchema = z.infer<typeof TeamSchema>;
