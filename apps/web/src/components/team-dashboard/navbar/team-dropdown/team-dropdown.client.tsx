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
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import clsx from 'clsx';
import { Link } from 'next-view-transitions';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { type ReactNode, use, useContext, useMemo } from 'react';
import { TeamSlugContext } from '../../team-slug-provider';
import { SlashSeparatedNavbarItem } from '../slash-separated-navbar-item';

type Props = {
	teamsPromise: Promise<Pick<TeamSchema, 'displayName' | 'slug'>[]>;
	currentTeam?: Pick<TeamSchema, 'slug'>;
};

export function TeamDropdownClient({ currentTeam, teamsPromise }: Props) {
	const teams = use(teamsPromise);

	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const currentTeamFull = currentTeam ? teams.find((team) => team.slug === currentTeam.slug) : undefined;
	const { team: urlTeam } = useContext(TeamSlugContext);

	// TODO: Figure out if this can be done with regular links as a server component instead of dynamically + client side
	const selectTeam = useMemo(
		() => (team: Pick<TeamSchema, 'slug'>) => {
			const newTeamSlug = encodeURIComponent(team.slug);

			if (urlTeam && pathname.startsWith(`/team/${urlTeam.slug}/`)) {
				// We are definitely on a team page, so we can just swap out the team slug with the selected one
				// We do a single string replace, which only does the first occurrence of the team slug
				// We include the full /team/ segment to avoid false positive (ex. a team with a slug "team", which would .replace() the wrong segment of the URL)

				const newPathname = pathname.replace(`/team/${urlTeam.slug}/`, `/team/${newTeamSlug}/`);

				router.push(`${newPathname}?${searchParams.toString()}`);
				return;
			}

			// Non team route, go to main dashboard
			router.push(`/team/${newTeamSlug}`);
		},
		[router, pathname, urlTeam, searchParams],
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
						// Undo the increased left padding that's kept for the checkbox
						// Having the padding on each item looks weird when there's no checkboxes shown
						className={clsx({
							'pl-2': !currentTeamFull,
						})}
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
	return (
		<SlashSeparatedNavbarItem team={{ slug, displayName }}>
			<DropdownMenuTrigger asChild={true}>
				<Button size='icon' variant='ghost'>
					<ChevronUpDownIcon className='w-4 h-4' />
				</Button>
			</DropdownMenuTrigger>
		</SlashSeparatedNavbarItem>
	);
}
