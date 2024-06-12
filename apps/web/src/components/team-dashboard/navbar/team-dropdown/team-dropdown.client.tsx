'use client';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronUpDownIcon, PlusIcon } from '@heroicons/react/16/solid';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { SlashIcon } from '@radix-ui/react-icons';
import { Link } from 'next-view-transitions';
import { useRouter } from 'next/navigation';
import { type PropsWithChildren, type ReactNode, useMemo } from 'react';

type Props = {
	teams: Pick<TeamSchema, 'displayName' | 'slug'>[];
	currentTeam?: Pick<TeamSchema, 'slug'>;
};

export function TeamDropdownClient({ currentTeam, teams }: Props) {
	const router = useRouter();
	const currentTeamFull = currentTeam ? teams.find((team) => team.slug === currentTeam.slug) : undefined;

	// TODO: Figure out if this can be done with regular links
	const selectTeam = useMemo(
		() => (team: Pick<TeamSchema, 'slug'>) => {
			router.push(`/team/${encodeURIComponent(team.slug)}`);
		},
		[router],
	);

	return (
		<DropdownMenu>
			{currentTeamFull && <TeamDropdownTrigger {...currentTeamFull} />}
			{!currentTeamFull && <TeamDropdownTrigger displayName='No team selected' />}

			<DropdownMenuContent align='end'>
				<DropdownMenuLabel>Your teams</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{teams.map((team) => (
					<DropdownMenuCheckboxItem
						key={team.slug}
						checked={currentTeamFull && currentTeamFull.slug === team.slug}
						onCheckedChange={() => selectTeam(team)}
					>
						{team.displayName}
					</DropdownMenuCheckboxItem>
				))}
				{teams.length === 0 && <DropdownMenuItem disabled={true}>You are not a member of any teams</DropdownMenuItem>}
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
export function TeamDropdownTrigger({
	displayName,
	slug,
}: Partial<Pick<TeamSchema, 'slug'>> & { displayName: ReactNode }) {
	const Outer = slug
		? ({ children, className }: PropsWithChildren<{ className?: string }>) => (
				<Link href={`/team/${slug}`} className={className}>
					{children}
				</Link>
			)
		: 'div';

	return (
		<Outer className='flex items-center leading-none'>
			<div className='px-2 text-muted-foreground'>
				<SlashIcon height={20} width={20} />
			</div>

			<div className='pr-2'>{displayName}</div>

			<DropdownMenuTrigger asChild={true}>
				<Button size='icon' variant='ghost'>
					<ChevronUpDownIcon className='w-4 h-4' />
				</Button>
			</DropdownMenuTrigger>
		</Outer>
	);
}
