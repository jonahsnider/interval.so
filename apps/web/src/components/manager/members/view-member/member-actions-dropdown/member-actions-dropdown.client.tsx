'use client';

import type { TeamMemberSchema } from '@interval.so/api/app/team_member/schemas/team_member_schema';
import { use } from 'react';
import { useLiveMember } from '@/src/trpc/live-queries';
import { MemberRowActionsDropdown } from '../../members-table/row-actions/row-actions-dropdown';

type Props = {
	member: Pick<TeamMemberSchema, 'id'>;
	memberDataPromise: Promise<Pick<TeamMemberSchema, 'name' | 'signedInAt' | 'archived'>>;
};

export function MemberActionsDropdownClient({ member, memberDataPromise }: Props) {
	const initialMemberData = use(memberDataPromise);
	const { data: memberData = initialMemberData } = useLiveMember(member, initialMemberData);

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
