import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamMemberSchema } from '@hours.frc.sh/api/app/team_member/schemas/team_member_schema';
import type { TimeFilterSchema } from '@hours.frc.sh/api/app/team_stats/schemas/time_filter_schema';
import { Suspense } from 'react';
import 'server-only';
import { MemberAttendanceTableClient } from './member-attendance-table.client';

type Props = {
	member: Pick<TeamMemberSchema, 'id'>;
	timeFilter: TimeFilterSchema;
};

export function MemberAttendanceTable({ member, timeFilter }: Props) {
	return (
		<Suspense fallback={<MemberAttendanceTableClient loading={true} initialMeetings={[]} member={member} />}>
			<MemberAttendanceTableFetcher member={member} timeFilter={timeFilter} />
		</Suspense>
	);
}

async function MemberAttendanceTableFetcher({ member, timeFilter }: Props) {
	const initialMeetings = await trpcServer.teams.meetings.getMeetingsForMember.query({ member, timeFilter });

	return <MemberAttendanceTableClient loading={false} initialMeetings={initialMeetings} member={member} />;
}
