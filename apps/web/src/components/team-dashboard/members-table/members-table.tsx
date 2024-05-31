'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/flex-table';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import clsx from 'clsx';
import { AnimatePresence, type Variants, motion } from 'framer-motion';
import Fuse from 'fuse.js/basic';
import { useQueryState } from 'nuqs';
import { useEffect, useMemo, useState } from 'react';

type Member = {
	name: string;
	atMeeting: boolean;
};

const members: Member[] = [
	{
		name: 'Apple',
		atMeeting: true,
	},
	{
		name: 'Banana',
		atMeeting: false,
	},
	{
		name: 'Cherry',
		atMeeting: true,
	},
	{
		name: 'Date',
		atMeeting: false,
	},
	{
		name: 'Elderberry',
		atMeeting: true,
	},
	{
		name: 'Fig',
		atMeeting: true,
	},
	{
		name: 'Grape',
		atMeeting: true,
	},
	{
		name: 'Honeydew',
		atMeeting: false,
	},
	{
		name: 'Jackfruit',
		atMeeting: true,
	},
	{
		name: 'Kiwi',
		atMeeting: true,
	},
];

const MotionTableRow = motion(TableRow);
const MotionTable = motion(Table);

const motionVariants: Variants = {
	hidden: { opacity: 0, height: 0 },
	visible: { opacity: 1, height: 'auto' },
};

export function MembersTable() {
	const fuse = useMemo(() => new Fuse(members, { keys: ['name'] }), []);
	const [filter, setFilter] = useQueryState('filter', { clearOnDefault: true, defaultValue: '' });

	// biome-ignore lint/correctness/useExhaustiveDependencies: This is a false positive
	useEffect(() => {
		fuse.setCollection(members);
	}, [members, fuse]);

	const trimmedFilter = filter.trim();

	const filteredMembers: ReadonlySet<Member> = useMemo(() => {
		if (trimmedFilter === '') {
			return new Set(members);
		}

		return new Set(fuse.search(trimmedFilter).map((result) => result.item));
	}, [trimmedFilter, fuse]);

	const noResults = filteredMembers.size === 0;

	return (
		<Card className='w-full max-w-xl'>
			<CardHeader>
				<CardTitle>Sign in & out</CardTitle>
			</CardHeader>

			<CardContent>
				<Input placeholder='Search names' value={filter} onChange={(e) => setFilter(e.target.value)} />
			</CardContent>

			<CardContent className='px-0 transition-all'>
				<AnimatePresence initial={false}>
					{!noResults && <InnerTable filteredMembers={filteredMembers} />}
					{noResults && (
						<motion.div
							initial='hidden'
							animate='visible'
							exit='hidden'
							variants={motionVariants}
							className='w-full justify-center flex items-center'
						>
							<p className='font-semibold px-4 py-2'>No results</p>
						</motion.div>
					)}
				</AnimatePresence>
			</CardContent>
		</Card>
	);
}
function InnerTable({ filteredMembers }: { filteredMembers: ReadonlySet<Member> }) {
	const indexOfLastVisibleMember = members.findLastIndex((member) => filteredMembers.has(member));

	return (
		<MotionTable initial='hidden' animate='visible' exit='hidden' variants={motionVariants} className='overflow-hidden'>
			<TableHeader>
				<TableRow>
					<TableHead className='pl-8'>Name</TableHead>
					<TableHead className='pr-8 text-right'>Signed in</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{members.map((member, index) => (
					<InnerTableRow
						key={member.name}
						visible={filteredMembers.has(member)}
						member={member}
						className={clsx({
							// Need to use JS for this because the CSS selector in TableBody doesn't factor in how rows are hidden
							'border-0': index === indexOfLastVisibleMember,
						})}
					/>
				))}
			</TableBody>
		</MotionTable>
	);
}

function InnerTableRow({ visible, className, member }: { visible: boolean; className?: string; member: Member }) {
	const [animating, setAnimating] = useState(false);

	return (
		<MotionTableRow
			initial='hidden'
			variants={motionVariants}
			animate={visible ? 'visible' : 'hidden'}
			onAnimationStart={() => setAnimating(true)}
			onAnimationComplete={() => setAnimating(false)}
			className={clsx(
				{
					invisible: !(visible || animating),
				},
				className,
			)}
		>
			<TableCell className='font-medium pl-8'>{member.name}</TableCell>
			<TableCell className='pr-8 text-right'>
				<Switch defaultChecked={member.atMeeting} />
			</TableCell>
		</MotionTableRow>
	);
}
