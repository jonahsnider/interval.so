import { z } from 'zod';

export const TeamSchema = z.object({
	slug: z.string().trim().toLowerCase().min(1).max(64),
	displayName: z.string().trim().min(1).max(64),
});
export type TeamSchema = z.infer<typeof TeamSchema>;
