import { z } from 'zod';

// TODO: Support leaving the end time undefined, which in database logic should mean not filtering by the end time at all
export const TimeRangeSchema = z.object({
	start: z.date(),
	end: z.date(),
});
export type TimeRangeSchema = z.infer<typeof TimeRangeSchema>;
