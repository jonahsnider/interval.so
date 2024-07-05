import { z } from 'zod';

export const TeamMeetingSchema = z.object({
	attendeeCount: z.number().int().nonnegative(),
	startedAt: z.date(),
	endedAt: z.date().optional(),
});
export type TeamMeetingSchema = z.infer<typeof TeamMeetingSchema>;
