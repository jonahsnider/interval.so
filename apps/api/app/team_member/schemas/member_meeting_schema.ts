import { z } from 'zod';

export const MemberMeetingSchema = z.object({
	id: z.string().uuid(),
	memberId: z.string().uuid(),
	startedAt: z.date(),
	endedAt: z.date(),
});
export type MemberMeetingSchema = z.infer<typeof MemberMeetingSchema>;
