import { z } from 'zod';

export const TimeFilterSchema = z
	.object({
		start: z.date(),
		/** End time in the filter. If `undefined`, the end time will be unbounded. */
		end: z.date().optional(),
	})
	.refine(
		({ start, end }) => {
			return end ? start.getTime() <= end.getTime() : true;
		},
		{ message: 'Start time must be before end time' },
	);
export type TimeFilterSchema = z.infer<typeof TimeFilterSchema>;
