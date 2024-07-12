import 'server-only';
import type { TeamMemberSchema } from '@hours.frc.sh/api/app/team_member/schemas/team_member_schema';
import { toTimeFilter } from '../../../period-select/duration-slug';
import { searchParamCache } from '../search-params';
import { AddAttendanceButton } from './add-attendance-button';
import { MemberAttendanceTable } from './member-attendance-table/member-attendance-table';
import { TimeFilterPicker } from './time-filter-picker';

type Props = {
	member: Pick<TeamMemberSchema, 'id'>;
};

export function MemberAttendanceSection({ member }: Props) {
	const searchParams = searchParamCache.all();

	const timeFilter = toTimeFilter(searchParams);

	return (
		<section className='flex flex-col gap-4'>
			<div className='flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4'>
				<div className='flex flex-col gap-2'>
					<h2 className='text-2xl font-semibold'>Attendance</h2>
					<p className='text-muted-foreground text-sm'>View or edit meetings that this member signed in for.</p>
				</div>

				<div className='flex max-xs:flex-wrap gap-4 items-center justify-end'>
					<TimeFilterPicker />

					<AddAttendanceButton className='w-full xs:max-w-min' member={member} />
				</div>
			</div>

			<MemberAttendanceTable member={member} timeFilter={timeFilter} />
		</section>
	);
}
