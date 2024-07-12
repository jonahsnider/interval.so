'use client';

import { trpc } from '@/src/trpc/trpc-client';
import type { TeamMemberSchema } from '@hours.frc.sh/api/app/team_member/schemas/team_member_schema';
import { use, useState } from 'react';
import { MemberRowActionsDropdown } from '../../members-table/row-actions/row-actions-dropdown';

type Props = {
	member: Pick<TeamMemberSchema, 'id'>;
	memberDataPromise: Promise<Pick<TeamMemberSchema, 'name' | 'atMeeting' | 'archived'>>;
};

export function MemberActionsDropdownClient({ member, memberDataPromise }: Props) {
	const initialMemberData = use(memberDataPromise);

	const [_memberData, setMemberData] = useState(initialMemberData);

	trpc.teams.members.getMemberSubscription.useSubscription(member, {
		onData: setMemberData,
	});

	return (
		<MemberRowActionsDropdown
			variant='standalone'
			member={{
				id: member.id,
				...initialMemberData,
			}}
		/>
	);
}
