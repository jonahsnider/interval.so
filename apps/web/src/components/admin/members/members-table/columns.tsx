'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SortableHeader } from '@/src/components/data-tables/sortable-header';
import { formatDate } from '@/src/utils/date-format';
import { ArchiveBoxIcon, UserIcon } from '@heroicons/react/16/solid';
import type { TeamMemberSchema } from '@hours.frc.sh/api/app/team_member/schemas/team_member_schema';
import { Sort } from '@jonahsnider/util';
import type { ColumnDef } from '@tanstack/react-table';
import { useParams } from 'next/navigation';
import { toTimeRange } from '../../period-select/duration-slug';
import { BatchActionsDropdown } from './batch-actions/batch-actions-dropdown';
import type { LastSeenAtFilter } from './members-table-buttons';
import { RowActionsDropdown } from './row-actions/row-actions-dropdown';

export const columns: ColumnDef<TeamMemberSchema>[] = [
	{
		id: 'select',
		header: ({ table }) => (
			<Checkbox
				checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
				aria-label='Select all'
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label='Select row'
			/>
		),
		enableSorting: false,
		enableHiding: false,
	},
	{
		// TODO: Good fuzzy search
		id: 'name',
		accessorKey: 'name',
		header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
		cell: ({ row }) => {
			// TODO: Modal with user information

			return (
				<Button variant='link' className='text-foreground p-0 h-auto'>
					{row.original.name}
				</Button>
			);
		},
	},
	{
		accessorKey: 'archived',
		header: ({ column }) => <SortableHeader column={column}>Archived</SortableHeader>,
		filterFn: (row, _columnId, filterValue: boolean[]) => {
			return filterValue.includes(row.original.archived);
		},
		cell: ({ row }) => {
			const icon = row.original.archived ? <ArchiveBoxIcon className='h-4 w-4' /> : <UserIcon className='h-4 w-4' />;

			return (
				<div className='flex items-center gap-2'>
					{icon}
					{row.original.archived ? 'Archived' : 'Not archived'}
				</div>
			);
		},
	},
	{
		accessorKey: 'lastSeenAt',
		sortingFn: Sort.ascending((row) => row.original.lastSeenAt ?? Number.NEGATIVE_INFINITY),
		enableColumnFilter: true,
		filterFn: (row, _columnId, filterValue) => {
			const rawFilter = filterValue as LastSeenAtFilter;

			if (!rawFilter) {
				return true;
			}

			const { current: timeRange } = toTimeRange(rawFilter);

			const usedLastSeenAt = row.original.lastSeenAt === 'now' ? new Date() : row.original.lastSeenAt;

			if (!usedLastSeenAt) {
				return false;
			}

			return (
				timeRange.start.getTime() <= usedLastSeenAt.getTime() && timeRange.end.getTime() >= usedLastSeenAt.getTime()
			);
		},
		header: ({ column }) => {
			return <SortableHeader column={column}>Last seen</SortableHeader>;
		},
		cell: ({ row }) => {
			if (!row.original.lastSeenAt) {
				return;
			}

			if (row.original.lastSeenAt === 'now') {
				return <p>Now</p>;
			}

			const shortContent = formatDate(row.original.lastSeenAt);
			const verboseContent = formatDate(row.original.lastSeenAt, true);

			if (shortContent === verboseContent) {
				return <p>{shortContent}</p>;
			}

			return (
				<Tooltip>
					<TooltipTrigger asChild={true}>
						<p>{shortContent}</p>
					</TooltipTrigger>
					<TooltipContent>{verboseContent}</TooltipContent>
				</Tooltip>
			);
		},
	},
	{
		id: 'actions',
		header: ({ table }) => {
			const params = useParams<{ team: string }>();

			if (!params.team) {
				throw new TypeError('Expected team Next.js route param to be defined');
			}

			return <BatchActionsDropdown table={table} team={{ slug: params.team }} />;
		},
		cell: ({ row }) => {
			return <RowActionsDropdown member={row.original} />;
		},
	},
];
