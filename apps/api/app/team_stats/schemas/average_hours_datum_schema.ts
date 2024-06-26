import { z } from 'zod';

export const AverageHoursDatumSchema = z.object({
	date: z.date(),
	averageHours: z.number().nonnegative(),
});
export type AverageHoursDatumSchema = z.infer<typeof AverageHoursDatumSchema>;
