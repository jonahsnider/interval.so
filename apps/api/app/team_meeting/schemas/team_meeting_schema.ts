import { z } from 'zod';
import { AttendanceEntrySchema } from '../../team_member_attendance/schemas/attendance_entry_schema.js';

export const TeamMeetingSchema = z
	.object({
		startedAt: z.date(),
		attendeeCount: z.number().int().nonnegative(),
	})
	.and(
		z
			.object({
				endedAt: z.date(),
				attendees: AttendanceEntrySchema.array(),
			})
			.or(
				z.object({
					endedAt: z.undefined(),
					attendees: z.undefined(),
				}),
			),
	);
export type TeamMeetingSchema = z.infer<typeof TeamMeetingSchema>;
