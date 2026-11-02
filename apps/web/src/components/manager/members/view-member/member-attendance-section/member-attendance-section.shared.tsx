import { PlusIcon } from '@heroicons/react/16/solid';
import type { PropsWithChildren, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { MemberAttendanceTableLoading } from './member-attendance-table/member-attendance-table.client';
import { TimeFilterPicker } from './time-filter-picker';

export function MemberAttendanceSectionContent({ actions, children }: PropsWithChildren<{ actions: ReactNode }>) {
	return (
		<section className='flex flex-col gap-4'>
			<div className='flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4'>
				<div className='flex flex-col gap-2'>
					<h2 className='text-2xl font-semibold'>Attendance</h2>
					<p className='text-muted-foreground text-sm'>View or edit meetings that this member signed in for.</p>
				</div>
				<div className='flex max-xs:flex-wrap gap-4 items-center justify-end'>{actions}</div>
			</div>
			{children}
		</section>
	);
}

export function MemberAttendanceSectionLoading() {
	return (
		<MemberAttendanceSectionContent
			actions={
				<>
					<TimeFilterPicker />
					<Button disabled className='w-full xs:max-w-min'>
						<PlusIcon className='h-4 w-4 mr-2' />
						Add attendance
					</Button>
				</>
			}
		>
			<MemberAttendanceTableLoading />
		</MemberAttendanceSectionContent>
	);
}
