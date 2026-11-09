'use client';

import { count } from '@jonahsnider/util';
import { Skeleton } from '@/components/ui/skeleton';
import { type MembersHandle, useLiveMembers } from '@/src/trpc/live-queries';

type Props = {
	membersHandle: MembersHandle;
};

export function TeamCardDescription({ membersHandle }: Props) {
	const { data: members } = useLiveMembers(membersHandle);
	if (!members) return <Skeleton className='h-5 w-48' />;

	const memberCount = count(members, (member) => member.signedInAt !== undefined);

	switch (memberCount) {
		case 0:
			return 'No members signed in currently';
		case 1:
			return '1 member signed in';
		default:
			return `${memberCount} members signed in`;
	}
}
