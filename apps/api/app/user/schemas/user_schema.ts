import { z } from 'zod';

export const UserSchema = z.object({
	id: z.string().uuid(),
	displayName: z
		.string()
		.trim()
		.min(1, { message: "Display name can't be empty" })
		.max(128, { message: "Display name can't be longer than 128 characters" }),
});
export type UserSchema = z.infer<typeof UserSchema>;
