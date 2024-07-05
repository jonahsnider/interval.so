import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { trpcServer } from '@/src/trpc/trpc-server';
import { PlusIcon } from '@heroicons/react/16/solid';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { Link } from 'next-view-transitions';
import { Suspense } from 'react';
import { TeamDropdownClient, TeamDropdownTrigger } from './team-dropdown.client';

function TeamDropdownSkeleton({ currentTeam }: { currentTeam?: Pick<TeamSchema, 'slug'> }) {
	return (
		<DropdownMenu>
			<TeamDropdownTrigger displayName={<Skeleton className='h-4 w-32' />} slug={currentTeam?.slug} />

			<DropdownMenuContent align='end'>
				<DropdownMenuLabel>Your teams</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem className='data-[disabled]:opacity-100' disabled={true}>
					<Skeleton className='h-4 w-32' />
				</DropdownMenuItem>
				<DropdownMenuItem className='data-[disabled]:opacity-100' disabled={true}>
					<Skeleton className='h-4 w-32' />
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<Link href='/team'>
					<DropdownMenuItem>
						<PlusIcon className='w-4 h-4 mr-2' />
						Create team
					</DropdownMenuItem>
				</Link>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function TeamDropdown({ currentTeam }: { currentTeam?: Pick<TeamSchema, 'slug'> }) {
	const teams = trpcServer.teams.forUser.getTeamNames.query();

	return (
		<Suspense fallback={<TeamDropdownSkeleton currentTeam={currentTeam} />}>
			<TeamDropdownClient teamsPromise={teams} currentTeam={currentTeam} />
		</Suspense>
	);
}
