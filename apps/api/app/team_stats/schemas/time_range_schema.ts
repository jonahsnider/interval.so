import { z } from 'zod';

export const TimeRangeSchema = z.object({
	start: z.date(),
	end: z.date(),
});
export type TimeRangeSchema = z.infer<typeof TimeRangeSchema>;
