import { z } from 'zod';

export const UniqueMembersDatumSchema = z.object({
	date: z.date(),
	memberCount: z.number().int().nonnegative(),
});
export type UniqueMembersDatumSchema = z.infer<typeof UniqueMembersDatumSchema>;
