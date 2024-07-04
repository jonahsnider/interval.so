'use client';

import { trpc } from '@/src/trpc/trpc-client';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { count } from '@jonahsnider/util';
import { use, useState } from 'react';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	initialMemberCountPromise: Promise<number>;
};

export function MemberCountTileInner({ team, initialMemberCountPromise }: Props) {
	const initialMemberCount = use(initialMemberCountPromise);
	const [memberCount, setMemberCount] = useState(initialMemberCount);

	trpc.teams.members.simpleMemberListSubscription.useSubscription(team, {
		onData: (data) => {
			setMemberCount(count(data, (member) => member.atMeeting));
		},
	});

	return (
		<>
			{memberCount} member{memberCount !== 1 && 's'}
		</>
	);
}
