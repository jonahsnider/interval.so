'use client';

import { ArchiveBoxIcon, UserIcon } from '@heroicons/react/16/solid';
import type { TeamMemberSchema } from '@interval.so/api/app/team_member/schemas/team_member_schema';
import { Sort } from '@jonahsnider/util';
import type { ColumnDef } from '@tanstack/react-table';
import { Link } from 'next-view-transitions';
import { useContext } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { SortableHeader } from '@/src/components/data-tables/sortable-header';
import { TeamSlugContext } from '@/src/components/team-dashboard/team-slug-provider';
import { formatDate } from '@/src/utils/date-format';
import { toTimeRange } from '../../period-select/duration-slug';
import { BatchActionsDropdown } from './batch-actions/batch-actions-dropdown';
import type { LastSeenAtFilter } from './members-table-buttons';
import { MemberRowActionsDropdown } from './row-actions/row-actions-dropdown';

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
		id: 'name',
		accessorKey: 'name',
		header: ({ column }) => <SortableHeader column={column}>Name</SortableHeader>,
		cell: ({ row }) => {
			const { team } = useContext(TeamSlugContext);

			if (!team) {
				throw new TypeError('Expected team Next.js route param to be defined');
			}

			return (
				<Link
					className={cn(buttonVariants({ variant: 'link' }), 'text-foreground p-0 h-auto whitespace-pre')}
					href={`/team/${team.slug}/dashboard/members/${row.original.id}`}
				>
					{row.original.name}
				</Link>
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
		accessorKey: 'signedInAt',
		filterFn: (row, _columnId, filterValue: boolean[]) => {
			return filterValue.includes(row.original.signedInAt !== undefined);
		},
	},
	{
		accessorKey: 'lastSeenAt',
		sortingFn: Sort.ascending((row) =>
			row.original.lastSeenAt === 'now'
				? Number.POSITIVE_INFINITY
				: (row.original.lastSeenAt ?? Number.NEGATIVE_INFINITY),
		),
		sortUndefined: -1,
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
			return (
				<div className='text-right'>
					<BatchActionsDropdown table={table} />
				</div>
			);
		},
		cell: ({ row }) => {
			const { team } = useContext(TeamSlugContext);

			if (!team) {
				throw new TypeError('Expected team Next.js route param to be defined');
			}

			return <MemberRowActionsDropdown member={row.original} team={team} />;
		},
	},
];
