'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { useParams, useSelectedLayoutSegment } from 'next/navigation';

const ENTRIES = [
	{
		label: 'General',
		hrefSuffix: '',
		segment: '(general)',
	},
	{
		label: 'Managers',
		hrefSuffix: '/managers',
		segment: 'managers',
	},
] as const;

export function SettingsSidebar() {
	const { team } = useParams<{ team: string }>();
	const segment = useSelectedLayoutSegment();
	const baseHref = `/team/${encodeURIComponent(team)}/dashboard/settings`;

	return (
		<nav className='flex flex-col gap-2 text-muted-foreground bg-background-muted'>
			{ENTRIES.map((entry) => (
				<Link
					key={entry.segment}
					href={`${baseHref}${entry.hrefSuffix}`}
					aria-current={segment === entry.segment ? 'page' : undefined}
					className={clsx('hover:bg-muted transition-colors py-2 px-3 rounded-md bg-background-muted', {
						'font-semibold text-foreground bg-muted/50': segment === entry.segment,
					})}
				>
					{entry.label}
				</Link>
			))}
		</nav>
	);
}
