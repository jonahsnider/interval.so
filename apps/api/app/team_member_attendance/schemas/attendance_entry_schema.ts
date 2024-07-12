import { z } from 'zod';
import { TeamMemberSchema } from '../../team_member/schemas/team_member_schema.js';

export const AttendanceEntrySchema = z.object({
	attendanceId: z.string().uuid(),
	startedAt: z.date(),
	endedAt: z.date(),
	member: TeamMemberSchema.pick({ name: true, id: true }),
});
export type AttendanceEntrySchema = z.infer<typeof AttendanceEntrySchema>;
