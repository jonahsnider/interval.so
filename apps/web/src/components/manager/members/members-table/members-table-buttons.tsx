'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTableFacetedFilter } from '@/src/components/data-tables/faceted-filter';
import { ArchiveBoxIcon, UserIcon, XMarkIcon } from '@heroicons/react/16/solid';
import type { TeamMemberSchema } from '@hours.frc.sh/api/app/team_member/schemas/team_member_schema';
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

	return (
		<div className='flex items-center gap-2'>
			<Input
				placeholder='Filter members...'
				value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
				onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
				className='max-w-36 lg:max-w-64 bg-background'
				disabled={loading}
			/>

			<DataTableFacetedFilter
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
			/>

			<PeriodSelect
				optional={true}
				setDatesAndClearDuration={setDatesAndClearDuration}
				setDurationAndClearDates={setDurationAndClearDates}
				start={(lastSeenAtColumn.getFilterValue() as LastSeenAtFilter)?.start}
				end={(lastSeenAtColumn.getFilterValue() as LastSeenAtFilter)?.end}
				duration={(lastSeenAtColumn.getFilterValue() as LastSeenAtFilter)?.duration}
				emptyText='Last seen'
				disabled={loading}
			/>

			{table.getState().columnFilters.length > 0 && (
				<Button
					variant='ghost'
					onClick={() => table.resetColumnFilters()}
					className='h-8 px-2 lg:px-3'
					disabled={loading}
				>
					Reset
					<XMarkIcon className='ml-2 h-4 w-4' />
				</Button>
			)}
		</div>
	);
}
