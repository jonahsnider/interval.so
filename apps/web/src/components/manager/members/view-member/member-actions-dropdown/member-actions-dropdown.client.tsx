'use client';

import type { TeamMemberSchema } from '@interval.so/api/app/team_member/schemas/team_member_schema';
import { use } from 'react';
import { useSubscription } from '@trpc/tanstack-react-query';
import { useTRPC } from '@/src/trpc/trpc-client';
import { MemberRowActionsDropdown } from '../../members-table/row-actions/row-actions-dropdown';

type Props = {
	member: Pick<TeamMemberSchema, 'id'>;
	memberDataPromise: Promise<Pick<TeamMemberSchema, 'name' | 'signedInAt' | 'archived'>>;
};

export function MemberActionsDropdownClient({ member, memberDataPromise }: Props) {
	const trpc = useTRPC();
	const initialMemberData = use(memberDataPromise);
	const { data: memberData = initialMemberData } = useSubscription(
		trpc.teams.members.getMemberSubscription.subscriptionOptions(member),
	);

	return (
		<MemberRowActionsDropdown
			variant='standalone'
			member={{
				id: member.id,
				...memberData,
			}}
		/>
	);
}
