import { z } from 'zod';
import { TeamMemberSchema } from '../../team_member/schemas/team_member_schema.js';

export const MeetingAttendeeSchema = TeamMemberSchema.pick({ name: true }).extend({
	attendanceId: z.string().uuid(),
	startedAt: z.date(),
	endedAt: z.date(),
});
export type MeetingAttendeeSchema = z.infer<typeof MeetingAttendeeSchema>;

export const TeamMeetingSchema = z
	.object({
		startedAt: z.date(),
		attendeeCount: z.number().int().nonnegative(),
	})
	.and(
		z
			.object({
				endedAt: z.date(),
				attendees: MeetingAttendeeSchema.array(),
			})
			.or(
				z.object({
					endedAt: z.undefined(),
					attendees: z.undefined(),
				}),
			),
	);
export type TeamMeetingSchema = z.infer<typeof TeamMeetingSchema>;
