'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { trpc } from '@/src/trpc/trpc-client';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import type { TeamMemberSchema } from '@interval.so/api/app/team_member/schemas/team_member_schema';
import { Sort } from '@jonahsnider/util';
import clsx from 'clsx';
import { AnimatePresence, type Variants, motion } from 'framer-motion';
import { use, useState } from 'react';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	membersPromise: Promise<Pick<TeamMemberSchema, 'name' | 'id' | 'signedInAt'>[]>;
};

export function MemberAvatarsClient({ membersPromise, team }: Props) {
	const initialMembers = use(membersPromise);

	const [members, setMembers] = useState(initialMembers);

	trpc.teams.members.simpleMemberListSubscription.useSubscription(team, {
		onData: (data) =>
			setMembers(
				data
					.filter(
						(member): member is typeof member & { signedInAt: NonNullable<(typeof member)['signedInAt']> } =>
							member.signedInAt !== undefined,
					)
					.toSorted(Sort.descending((member) => member.signedInAt)),
			),
	});

	return (
		<ScrollArea className='w-full'>
			{/* Minimum height matches the height of the avatars, to ensure that there is no height shift when going from 0 -> 1 members signed in */}
			<div className='w-full flex justify-start items-center min-h-10'>
				<AnimatePresence initial={true}>
					{members.map((member, index) => (
						<MemberAvatar key={member.id} member={member} index={index} elements={members.length} />
					))}
				</AnimatePresence>
			</div>
			<ScrollBar orientation='horizontal' />
		</ScrollArea>
	);
}

const avatarMotionVariants: Variants = {
	hidden: {
		opacity: 0,
		// Height in pixels, taken from the Avatar component
		y: 40,
		transition: { duration: 0.3 },
	},
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.3 },
	},
};

const MotionAvatar = motion.create(Avatar);

const FIRST_TWO_INTIALS_REGEXP = /^(\S)\S*\s*(\S)?/;

function MemberAvatar({
	member,
	index,
	elements,
}: { member: Pick<TeamMemberSchema, 'name'>; index: number; elements: number }) {
	const [, firstInitial, secondInitial] = FIRST_TWO_INTIALS_REGEXP.exec(member.name) ?? [];

	return (
		<Tooltip>
			<TooltipTrigger asChild={true}>
				<MotionAvatar
					variants={avatarMotionVariants}
					initial='hidden'
					animate='visible'
					exit='hidden'
					layout={true}
					style={{
						// Lower index is on top, higher index is on bottom
						// @ts-expect-error This is a custom property
						'--z-offset': elements - index,
					}}
					className={clsx('-mr-3 hover:mr-0 transition-[margin] duration-200 z-[var(--z-offset)]', {
						// The first item doesn't need spacing on the left, since there's nothing covering it
						'hover:ml-3': index !== 0,
					})}
				>
					<AvatarFallback className='bg-background border-2 border-border truncate'>
						{firstInitial}
						{secondInitial}
					</AvatarFallback>
				</MotionAvatar>
			</TooltipTrigger>
			<TooltipContent>{member.name}</TooltipContent>
		</Tooltip>
	);
}
