import type { TeamMemberSchema } from '@interval.so/api/app/team_member/schemas/team_member_schema';
import type { TimeFilterSchema } from '@interval.so/api/app/team_stats/schemas/time_filter_schema';
import { Suspense } from 'react';
import { trpcServer } from '@/src/trpc/trpc-server';
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
	const initialMeetings = await trpcServer.teams.members.attendance.getEntriesForMember.query({ member, timeFilter });

	return <MemberAttendanceTableClient loading={false} initialMeetings={initialMeetings} member={member} />;
}
