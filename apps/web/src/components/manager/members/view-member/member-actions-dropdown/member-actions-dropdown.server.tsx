import type { TeamMemberSchema } from '@interval.so/api/app/team_member/schemas/team_member_schema';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { trpcServer } from '@/src/trpc/trpc-server';
import { MemberActionsDropdownClient } from './member-actions-dropdown.client';

export function MemberActionsDropdown({ member }: { member: Pick<TeamMemberSchema, 'id'> }) {
	const memberDataPromise = trpcServer.teams.members.getMember.query(member);

	return (
		<Suspense fallback={<Skeleton className='h-9 w-9' />}>
			<MemberActionsDropdownClient member={member} memberDataPromise={memberDataPromise} />
		</Suspense>
	);
}
