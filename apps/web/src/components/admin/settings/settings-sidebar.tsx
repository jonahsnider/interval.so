'use client';

import clsx from 'clsx';
import { Link } from 'next-view-transitions';
import { usePathname } from 'next/navigation';

type NavbarEntryData = {
	label: string;
	hrefSuffix: string;
};

const ENTRIES: NavbarEntryData[] = [
	{
		label: 'General',
		hrefSuffix: '',
	},
	{
		label: 'Admins',
		hrefSuffix: '/admins',
	},
];

function NavbarEntry({ label, hrefSuffix }: NavbarEntryData) {
	const pathname = usePathname();

	const currentTeamSlug = 'team581';

	const href = `/team/${currentTeamSlug}/admin/settings${hrefSuffix}`;
	const active = pathname.endsWith(href);

	return (
		<Link
			href={href}
			className={clsx('hover:bg-muted transition-colors py-2 px-3 rounded-md', {
				'font-semibold text-foreground': active,
			})}
		>
			{label}
		</Link>
	);
}

export function SettingsSidebar() {
	return (
		<nav className='flex flex-col gap-2 text-sm text-muted-foreground'>
			{ENTRIES.map((entry) => (
				<NavbarEntry key={entry.label} {...entry} />
			))}
		</nav>
	);
}
