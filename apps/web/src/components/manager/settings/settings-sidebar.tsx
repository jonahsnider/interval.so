import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import clsx from 'clsx';
import { Link } from 'next-view-transitions';

type SidebarEntryData = {
	label: string;
	hrefSuffix: string;
	id: string;
};

const ENTRIES = [
	{
		label: 'General',
		hrefSuffix: '',
		id: 'general',
	},
	{
		label: 'Managers',
		hrefSuffix: '/managers',
		id: 'managers',
	},
] as const satisfies SidebarEntryData[];

export type SidebarEntryId = (typeof ENTRIES)[number]['id'];

function SidebarEntry({
	entry,
	team,
	active,
}: {
	entry: SidebarEntryData;
	team: Pick<TeamSchema, 'slug'>;
	active: boolean;
}) {
	const href = `/team/${encodeURIComponent(team.slug)}/dashboard/settings${entry.hrefSuffix}`;

	return (
		<Link
			href={href}
			className={clsx('hover:bg-muted transition-colors py-2 px-3 rounded-md', {
				'font-semibold text-foreground': active,
			})}
		>
			{entry.label}
		</Link>
	);
}

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	pageId: SidebarEntryId;
};

export function SettingsSidebar({ team, pageId }: Props) {
	return (
		<nav className='flex flex-col gap-2 text-sm text-muted-foreground'>
			{ENTRIES.map((entry) => (
				<SidebarEntry key={entry.label} entry={entry} team={team} active={pageId === entry.id} />
			))}
		</nav>
	);
}
