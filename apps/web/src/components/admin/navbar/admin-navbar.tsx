'use client';

import clsx from 'clsx';
import { AnimatePresence, type Variants, motion } from 'framer-motion';
import { Link } from 'next-view-transitions';
import { usePathname } from 'next/navigation';
import { TeamPageNavbar } from '../../team-dashboard/navbar/team-page-navbar';

type NavbarEntryData = {
	label: string;
	hrefSuffix: string;
	matcher: RegExp;
};

const ENTRIES: NavbarEntryData[] = [
	{
		label: 'Dashboard',
		hrefSuffix: '',
		matcher: /^$/,
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

function NavbarEntry({ label, hrefSuffix, matcher }: NavbarEntryData) {
	const pathname = usePathname();

	const currentTeamSlug = 'team581';

	const prefix = `/team/${currentTeamSlug}/admin`;

	const href = `${prefix}${hrefSuffix}`;
	const active = matcher.test(pathname.slice(prefix.length));

	return (
		<Link
			href={href}
			className={clsx('border-b-2 pb-2', {
				'text-muted-foreground hover:text-inherit transition-colors font-medium border-transparent': !active,
				'border-primary': active,
			})}
		>
			{label}
		</Link>
	);
}

const motionVariants: Variants = {
	hidden: { opacity: 0, height: 0 },
	visible: { opacity: 1, height: 'auto' },
};

export function AdminNavbar() {
	return (
		<TeamPageNavbar className='pb-0'>
			<AnimatePresence initial={false}>
				<motion.nav
					initial='hidden'
					animate='visible'
					variants={motionVariants}
					className='flex gap-6 justify-start items-center font-medium pt-2 col-span-full'
				>
					{ENTRIES.map((entry) => (
						<NavbarEntry key={entry.hrefSuffix} {...entry} />
					))}
				</motion.nav>
			</AnimatePresence>
		</TeamPageNavbar>
	);
}
