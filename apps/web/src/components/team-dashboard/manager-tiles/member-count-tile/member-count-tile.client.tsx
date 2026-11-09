'use client';

import { count } from '@jonahsnider/util';
import { Skeleton } from '@/components/ui/skeleton';
import { type MembersHandle, useLiveMembers } from '@/src/trpc/live-queries';

type Props = {
	membersHandle: MembersHandle;
};

export function MemberCountTileInner({ membersHandle }: Props) {
	const { data: members } = useLiveMembers(membersHandle);
	if (!members) return <Skeleton className='h-9 lg:h-10 w-full' />;

	const memberCount = count(members, (member) => member.signedInAt !== undefined);

	return (
		<>
			{memberCount} member{memberCount !== 1 && 's'}
		</>
	);
}
