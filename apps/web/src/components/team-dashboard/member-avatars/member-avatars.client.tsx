'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { trpc } from '@/src/trpc/trpc-client';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import type { TeamMemberSchema } from '@hours.frc.sh/api/app/team_member/schemas/team_member_schema';
import { AnimatePresence, type Variants, motion } from 'framer-motion';
import { use, useState } from 'react';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	membersPromise: Promise<Pick<TeamMemberSchema, 'name' | 'id'>[]>;
};

const containerMotionVariants: Variants = {
	noItems: {
		height: 0,
	},
	items: {
		// Height of the avatar components
		height: '2.5rem',
	},
};

export function MemberAvatarsClient({ membersPromise, team }: Props) {
	const initialMembers = use(membersPromise);

	const [members, setMembers] = useState(initialMembers);

	// TODO: Sort to have the most recently signed in members at the top
	// This requires changing the query to have a signedInAt field
	// Could be the simple or the full query
	// Might be worth refactoring simple member list to use a signedInAt field instead of just atMeeting
	trpc.teams.members.simpleMemberListSubscription.useSubscription(team, {
		onData: (data) => setMembers(data.filter((member) => member.atMeeting)),
	});

	return (
		<ScrollArea className='w-full'>
			<motion.div
				className='w-full flex justify-start items-center'
				layout='size'
				variants={containerMotionVariants}
				animate={members.length > 0 ? 'items' : 'noItems'}
			>
				<AnimatePresence initial={false}>
					{members.map((member) => (
						<MemberAvatar key={member.id} member={member} />
					))}
				</AnimatePresence>
			</motion.div>
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

const MotionAvatar = motion(Avatar);

const FIRST_TWO_INTIALS_REGEXP = /^(\S)\S*\s*(\S)/i;

function MemberAvatar({ member }: { member: Pick<TeamMemberSchema, 'name'> }) {
	const matches = FIRST_TWO_INTIALS_REGEXP.exec(member.name);

	// TODO: The items should be covering up the item after them, not the other way around

	return (
		<Tooltip>
			<TooltipTrigger>
				<MotionAvatar
					variants={avatarMotionVariants}
					initial='hidden'
					animate='visible'
					exit='hidden'
					layout={true}
					className='-mr-3 hover:mr-0 transition-[margin] duration-200'
				>
					<AvatarFallback className='bg-background border-2 border-border truncate'>
						{matches?.[1]}
						{matches?.[2]}
					</AvatarFallback>
				</MotionAvatar>
			</TooltipTrigger>
			<TooltipContent>{member.name}</TooltipContent>
		</Tooltip>
	);
}
