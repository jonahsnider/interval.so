'use client';
import { PlusIcon } from '@heroicons/react/16/solid';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import type { TeamMemberSchema } from '@interval.so/api/app/team_member/schemas/team_member_schema';
import { concatIterables } from '@jonahsnider/util';
import clsx from 'clsx';
import Fuse from 'fuse.js/basic';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/flex-table';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { trpc } from '@/src/trpc/trpc-client';
import { CreateMemberDialog } from '../../members/create-member/create-member-dialog';

const MotionTableRow = motion.create(TableRow);
const MotionTable = motion.create(Table);

const motionVariants: Variants = {
	hidden: {
		opacity: 0,
		height: 0,
		transitionEnd: {
			position: 'absolute',
		},
	},
	visible: { opacity: 1, height: 'auto', position: 'relative' },
};

type SimpleMember = Pick<TeamMemberSchema, 'id' | 'name' | 'signedInAt'>;

type Props = {
	initialData: SimpleMember[];
	team: Pick<TeamSchema, 'slug'>;
};

export function AttendanceTable({ initialData, team }: Props) {
	const [members, setMembers] = useState(initialData);

	trpc.teams.members.simpleMemberListSubscription.useSubscription(team, {
		onData: setMembers,
	});

	const fuse = useMemo(() => new Fuse(members, { keys: ['name'] }), [members]);
	const [filter, setFilter] = useState('');

	useEffect(() => {
		fuse.setCollection(members);
	}, [members, fuse]);

	const trimmedFilter = filter.trim();

	const filteredMembers = useMemo(() => {
		if (trimmedFilter === '') {
			return members;
		}

		return fuse.search(trimmedFilter).map((result) => result.item);
	}, [trimmedFilter, fuse, members]);

	return (
		<Card className='w-full md:max-w-xl'>
			<CardHeader>
				<CardTitle>Sign in & out</CardTitle>
			</CardHeader>

			<CardContent className='flex gap-2'>
				<Input
					className='min-w-32'
					placeholder='Search names'
					value={filter}
					onChange={(e) => setFilter(e.target.value)}
				/>
				<CreateMemberDialog team={team} className='motion-safe:transition-[padding] motion-safe:hover:px-6'>
					<PlusIcon className='h-4 w-4 mr-2' />
					Sign up
				</CreateMemberDialog>
			</CardContent>

			<CardContent className='px-0 pb-0 transition-all'>
				<AnimatePresence initial={false}>
					<InnerTable filteredMembers={filteredMembers} members={members} />
				</AnimatePresence>
			</CardContent>
		</Card>
	);
}
function InnerTable({ filteredMembers, members }: { filteredMembers: SimpleMember[]; members: SimpleMember[] }) {
	const visibleMembers = useMemo(() => new Set(filteredMembers), [filteredMembers]);
	const sortedMembers = useMemo(
		() => [...new Set(concatIterables(members, filteredMembers))],
		[members, filteredMembers],
	);
	const indexOfLastVisibleMember = useMemo(
		() => sortedMembers.findLastIndex((member) => visibleMembers.has(member)),
		[sortedMembers, visibleMembers],
	);

	// Can't use AnimatePresence to handle row animations due to this bug https://github.com/framer/motion/issues/2023
	// Have to do this awful stuff to hide the elements on the DOM without actually unmounting them

	return (
		<MotionTable
			initial='hidden'
			animate='visible'
			exit='hidden'
			variants={motionVariants}
			// Overflow Y hidden so that the invisible rows don't cause a scrollbar (since they still have a 1px height for some reason)
			className='min-w-min overflow-y-hidden'
		>
			<TableHeader>
				<TableRow>
					<TableHead className='pl-8'>Name</TableHead>
					<TableHead className='pr-8 text-right'>Signed in</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{sortedMembers.map((member, index) => (
					<InnerTableRow
						key={member.name}
						visible={visibleMembers.has(member)}
						member={member}
						className={clsx({
							// Need to use JS for this because the CSS selector in TableBody doesn't factor in how rows are hidden
							'border-0 rounded-b-lg': index === indexOfLastVisibleMember,
						})}
					/>
				))}
				{filteredMembers.length === 0 && (
					<MotionTableRow initial='hidden' animate='visible' exit='hidden' variants={motionVariants}>
						<TableCell className='h-16 w-full items-center justify-center'>No results</TableCell>
					</MotionTableRow>
				)}
			</TableBody>
		</MotionTable>
	);
}

function InnerTableRow({ visible, className, member }: { visible: boolean; className?: string; member: SimpleMember }) {
	const [animating, setAnimating] = useState(false);
	const [checked, setChecked] = useState(Boolean(member.signedInAt));

	// Trying to do this the more correct way with useOptimistic was complicated and didn't work
	// I didn't want to spend more time debugging, so I just did it this way
	// This allows users to see the switch reflect their action optimistically, but reverts to the server state whenever new information is received or the mutation errors
	useEffect(() => {
		setChecked(Boolean(member.signedInAt));
	}, [member.signedInAt]);

	const mutation = trpc.teams.members.updateAttendance.useMutation({
		onMutate: ({ data }) => {
			setChecked(data.atMeeting);
		},
		onError: (error, { data }) => {
			const action = data.atMeeting ? 'in' : 'out';
			toast.error(`Unable to sign ${member.name} ${action}`, {
				description: error.message,
			});

			// Revert state
			setChecked(!data.atMeeting);
		},
	});

	return (
		<MotionTableRow
			initial='hidden'
			variants={motionVariants}
			animate={visible ? 'visible' : 'hidden'}
			onAnimationStart={() => setAnimating(true)}
			onAnimationComplete={() => setAnimating(false)}
			layout={visible}
			transition={{ stiffness: 100 }}
			className={clsx(
				{
					// This helps prevent hidden rows from being "on top" of shown rows when filtering
					// Otherwise, you get weird behavior like hover states being applied to hidden rows
					invisible: !(visible || animating),
				},
				className,
			)}
		>
			<TableCell className='font-medium pl-8 whitespace-pre'>{member.name}</TableCell>
			<TableCell className='pr-8 text-right'>
				<Switch
					checked={checked}
					onCheckedChange={(checked) => mutation.mutate({ member, data: { atMeeting: checked } })}
					disabled={mutation.isPending}
					className={clsx({ 'opacity-0': !visible })}
				/>
			</TableCell>
		</MotionTableRow>
	);
}
