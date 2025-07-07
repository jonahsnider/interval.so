'use client';

import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { count } from '@jonahsnider/util';
import { use, useState } from 'react';
import { trpc } from '@/src/trpc/trpc-client';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	initialMemberCountPromise: Promise<number>;
};

export function MemberCountTileInner({ team, initialMemberCountPromise }: Props) {
	const initialMemberCount = use(initialMemberCountPromise);
	const [memberCount, setMemberCount] = useState(initialMemberCount);

	trpc.teams.members.simpleMemberListSubscription.useSubscription(team, {
		onData: (data) => {
			setMemberCount(count(data, (member) => member.signedInAt !== undefined));
		},
	});

	return (
		<>
			{memberCount} member{memberCount !== 1 && 's'}
		</>
	);
}
