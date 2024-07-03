import { z } from 'zod';

export const TimeRangeSchema = z
	.object({
		start: z.date(),
		end: z.date(),
	})
	.refine(
		({ start, end }) => {
			return start.getTime() <= end.getTime();
		},
		{ message: 'Start time must be before end time' },
	);
export type TimeRangeSchema = z.infer<typeof TimeRangeSchema>;
