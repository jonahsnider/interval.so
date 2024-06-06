import { z } from 'zod';

export const UserSchema = z.object({
	id: z.string().uuid(),
	displayName: z.string().min(1).max(128),
});
export type UserSchema = z.infer<typeof UserSchema>;
