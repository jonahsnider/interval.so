import { z } from 'zod';

export const NowOrEarlierSchema = z
	.date()
	.refine((date) => date <= new Date(), { message: 'Date must not be in the future' });
export type NowOrEarlierSchema = z.infer<typeof NowOrEarlierSchema>;
