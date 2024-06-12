'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/flex-table';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { trpc } from '@/src/trpc/trpc-client';
import type { TeamMemberSchema } from '@hours.frc.sh/api/app/team_member/schemas/team_member_schema';
import clsx from 'clsx';
import { AnimatePresence, type Variants, motion } from 'framer-motion';
import Fuse from 'fuse.js/basic';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const MotionTableRow = motion(TableRow);
const MotionTable = motion(Table);

const motionVariants: Variants = {
	hidden: { opacity: 0, height: 0 },
	visible: { opacity: 1, height: 'auto' },
};

type SimpleMember = Pick<TeamMemberSchema, 'id' | 'name' | 'atMeeting'>;

type Props = {
	members: SimpleMember[];
};

export function MembersTable({ members }: Props) {
	const fuse = useMemo(() => new Fuse(members, { keys: ['name'] }), [members]);
	const [filter, setFilter] = useQueryState('filter', { clearOnDefault: true, defaultValue: '' });

	useEffect(() => {
		fuse.setCollection(members);
	}, [members, fuse]);

	const trimmedFilter = filter.trim();

	const filteredMembers: ReadonlySet<SimpleMember> = useMemo(() => {
		if (trimmedFilter === '') {
			return new Set(members);
		}

		return new Set(fuse.search(trimmedFilter).map((result) => result.item));
	}, [trimmedFilter, fuse, members]);

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
					{!noResults && <InnerTable filteredMembers={filteredMembers} members={members} />}
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
function InnerTable({
	filteredMembers,
	members,
}: { filteredMembers: ReadonlySet<SimpleMember>; members: SimpleMember[] }) {
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

function InnerTableRow({ visible, className, member }: { visible: boolean; className?: string; member: SimpleMember }) {
	const [animating, setAnimating] = useState(false);
	const [checked, setChecked] = useState(member.atMeeting);

	const router = useRouter();

	// Trying to do this the more correct way with useOptimistic was complicated and didn't work
	// I didn't want to spend more time debugging, so I just did it this way
	// This allows users to see the switch reflect their action optimistically, but reverts to the server state whenever new information is received or the mutation errors
	useEffect(() => {
		setChecked(member.atMeeting);
	}, [member.atMeeting]);

	const mutation = trpc.teams.members.updateAttendance.useMutation({
		onMutate: ({ atMeeting }) => {
			setChecked(Boolean(atMeeting));
		},
		onSettled: () => {
			router.refresh();
		},
		onError: (error, { atMeeting }) => {
			const action = atMeeting ? 'in' : 'out';
			toast.error(`Unable to sign ${member.name} ${action}`, {
				description: error.message,
			});

			// Revert state
			setChecked(!atMeeting);
		},
	});

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
				<Switch
					checked={checked}
					onCheckedChange={(checked) => mutation.mutate({ id: member.id, atMeeting: checked })}
					disabled={mutation.isPending}
				/>
			</TableCell>
		</MotionTableRow>
	);
}
