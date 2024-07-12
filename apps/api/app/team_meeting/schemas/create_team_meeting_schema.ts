import { convert } from 'convert';
import { intervalToDuration, milliseconds } from 'date-fns';
import { z } from 'zod';
import { TeamMemberSchema } from '../../team_member/schemas/team_member_schema.js';
import { TimeRangeSchema } from '../../team_stats/schemas/time_range_schema.js';

export const CreateTeamMeetingSchema = z.object({
	timeRange: TimeRangeSchema.refine(
		(timeRange) => {
			const duration = intervalToDuration(timeRange);

			return convert(milliseconds(duration), 'ms').to('minutes') > 1;
		},
		{ message: 'Meeting duration must be at least 1 minute' },
	),
	attendees: z.array(TeamMemberSchema.pick({ id: true })).min(1, { message: 'You must select at least one member' }),
});
export type CreateTeamMeetingSchema = z.infer<typeof CreateTeamMeetingSchema>;
