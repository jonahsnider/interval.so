'use client';

import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

type NavbarEntryData = {
	label: string;
	hrefSuffix: string;
	matcher: RegExp;
};

const ENTRIES: NavbarEntryData[] = [
	{
		label: 'Dashboard',
		hrefSuffix: '',
		// Matches the root path, or any dashboard subpaths
		matcher: /^(?:\/hours)?$/,
	},
	{
		label: 'Members',
		hrefSuffix: '/members',
		matcher: /^\/members/,
	},
	{
		label: 'Meetings',
		hrefSuffix: '/meetings',
		matcher: /^\/meetings/,
	},
	{
		label: 'Settings',
		hrefSuffix: '/settings',
		matcher: /^\/settings/,
	},
];

function NavbarEntry({ entry, team }: { entry: NavbarEntryData; team: Pick<TeamSchema, 'slug'> }) {
	const pathname = usePathname();

	const prefix = `/team/${team.slug}/dashboard`;

	const href = `${prefix}${entry.hrefSuffix}`;
	const active = entry.matcher.test(pathname.slice(prefix.length));

	return (
		<Link
			href={href}
			className={clsx('border-b-2 pb-2', {
				'text-muted-foreground hover:text-inherit transition-colors font-medium border-transparent': !active,
				'border-primary': active,
			})}
		>
			{entry.label}
		</Link>
	);
}

export function ManagerNavbarInner({ team }: { team: Pick<TeamSchema, 'slug'> }) {
	return (
		<nav className='flex gap-6 justify-start items-center font-medium pt-2 col-span-full'>
			{ENTRIES.map((entry) => (
				<NavbarEntry key={entry.hrefSuffix} entry={entry} team={team} />
			))}
		</nav>
	);
}
