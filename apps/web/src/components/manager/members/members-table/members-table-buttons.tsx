'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTableFacetedFilter } from '@/src/components/data-tables/faceted-filter';
import { ArchiveBoxIcon, CheckIcon, UserIcon, XMarkIcon } from '@heroicons/react/16/solid';
import type { TeamMemberSchema } from '@interval.so/api/app/team_member/schemas/team_member_schema';
import type { Table } from '@tanstack/react-table';
import type { SelectRangeEventHandler } from 'react-day-picker';
import { DurationSlug } from '../../period-select/duration-slug';
import { PeriodSelect } from '../../period-select/period-select';

type Props = {
	table: Table<TeamMemberSchema>;
	// Filters aren't persisted outside of the table component, so we shouldn't allow users to set filters on the skeleton table
	// Once the data loads in, they will be lost
	loading: boolean;
};

export type LastSeenAtFilter =
	| {
			duration: DurationSlug;
			start?: Date;
			end?: Date;
	  }
	| undefined;

export function MembersTableButtons({ table, loading }: Props) {
	const lastSeenAtColumn = table.getColumn('lastSeenAt');

	if (!lastSeenAtColumn) {
		throw new TypeError('Expected lastSeenAt column to be defined');
	}

	const setDurationAndClearDates = (value?: DurationSlug) => {
		lastSeenAtColumn.setFilterValue(
			value
				? {
						duration: value,
						start: undefined,
						end: undefined,
					}
				: undefined,
		);
	};

	const setDatesAndClearDuration: SelectRangeEventHandler = (event) => {
		lastSeenAtColumn.setFilterValue({
			duration: DurationSlug.Custom,
			start: event?.from ?? undefined,
			end: event?.to ?? undefined,
		});
	};

	const lastSeenAtFilter = lastSeenAtColumn.getFilterValue() as LastSeenAtFilter;
	return (
		<div className='flex items-center gap-2 flex-wrap'>
			<Input
				placeholder='Filter members...'
				onChange={(event) => table.setGlobalFilter(event.target.value)}
				className='xs:max-w-36 md:max-w-64 bg-background xs:flex-grow flex-grow-0'
				disabled={loading}
			/>

			<DataTableFacetedFilter
				icon={ArchiveBoxIcon}
				title='Archived'
				column={table.getColumn('archived')}
				disabled={loading}
				options={[
					{
						label: 'Archived',
						value: true,
						icon: ArchiveBoxIcon,
					},
					{
						label: 'Not archived',
						value: false,
						icon: UserIcon,
					},
				]}
				className='max-xs:flex-grow'
			/>

			<DataTableFacetedFilter
				icon={UserIcon}
				title='Signed in'
				column={table.getColumn('signedInAt')}
				disabled={loading}
				options={[
					{
						label: 'Signed in',
						value: true,
						icon: CheckIcon,
					},
					{
						label: 'Not signed in',
						value: false,
						icon: XMarkIcon,
					},
				]}
				className='max-xs:flex-grow'
			/>

			<PeriodSelect
				optional={true}
				setDatesAndClearDuration={setDatesAndClearDuration}
				setDurationAndClearDates={setDurationAndClearDates}
				start={lastSeenAtFilter?.start}
				end={lastSeenAtFilter?.end}
				duration={lastSeenAtFilter?.duration}
				emptyText='Last seen'
				disabled={loading}
				className='max-xs:flex-grow'
			/>

			{table.getState().columnFilters.length > 0 && (
				<Button
					variant='ghost'
					onClick={() => table.resetColumnFilters()}
					className='h-8 px-2 lg:px-3 max-xs:flex-grow'
					disabled={loading}
				>
					Reset
					<XMarkIcon className='ml-2 h-4 w-4' />
				</Button>
			)}
		</div>
	);
}
