'use client';
import { PageHeaderTitle } from '@/src/components/page-header';
import { trpc } from '@/src/trpc/trpc-client';
import type { TeamMemberSchema } from '@interval.so/api/app/team_member/schemas/team_member_schema';
import { useState } from 'react';

type Props = {
	member: Pick<TeamMemberSchema, 'id'>;
	initialMember: Pick<TeamMemberSchema, 'name'>;
};

export function TitleClient({ member, initialMember }: Props) {
	const [memberName, setMemberName] = useState(initialMember.name);

	trpc.teams.members.getMemberSubscription.useSubscription(member, {
		onData: (data) => setMemberName(data.name),
	});

	return (
		<PageHeaderTitle className='whitespace-pre group-hover:bg-input transition-colors p-1 rounded-md'>
			{memberName}
		</PageHeaderTitle>
	);
}
