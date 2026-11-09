import type { TeamMemberSchema } from '@interval.so/api/app/team_member/schemas/team_member_schema';
import { ensureEntry, loadHandles } from '@trpc/tanstack-react-query/unstable-handles';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { HydrateClient, trpc } from '@/src/trpc/trpc-server';
import { MemberActionsDropdownClient } from './member-actions-dropdown.client';

export function MemberActionsDropdown({ member }: { member: Pick<TeamMemberSchema, 'id'> }) {
	return (
		<Suspense fallback={<Skeleton className='h-9 w-9' />}>
			<MemberActionsDropdownFetcher member={member} />
		</Suspense>
	);
}

async function MemberActionsDropdownFetcher({ member }: { member: Pick<TeamMemberSchema, 'id'> }) {
	const [handles] = await loadHandles(trpc, { member: ensureEntry(trpc.teams.members.getMember, member) });

	return (
		<HydrateClient>
			<MemberActionsDropdownClient memberHandle={handles.member} />
		</HydrateClient>
	);
}
