import 'server-only';
import { io } from 'next/cache';
import type { TeamMemberSchema } from '@interval.so/api/app/team_member/schemas/team_member_schema';
import { toTimeFilter } from '../../../period-select/duration-slug';
import { searchParamCache } from '../search-params';
import { AddAttendanceButton } from './add-attendance-button';
import { MemberAttendanceTable } from './member-attendance-table/member-attendance-table';
import { TimeFilterPicker } from './time-filter-picker';
import { MemberAttendanceSectionContent } from './member-attendance-section.shared';

type Props = {
	member: Pick<TeamMemberSchema, 'id'>;
};

export async function MemberAttendanceSection({ member }: Props) {
	const searchParams = searchParamCache.all();

	await io();
	const timeFilter = toTimeFilter(searchParams);

	return (
		<MemberAttendanceSectionContent
			actions={
				<>
					<TimeFilterPicker />
					<AddAttendanceButton className='w-full xs:max-w-min' member={member} />
				</>
			}
		>
			<MemberAttendanceTable member={member} timeFilter={timeFilter} />
		</MemberAttendanceSectionContent>
	);
}
