'use client';

import { trpc } from '@/src/trpc/trpc-client';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { count } from '@jonahsnider/util';
import { use, useState } from 'react';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	initialMemberCountPromise: Promise<number>;
};

export function TeamCardDescription({ team, initialMemberCountPromise }: Props) {
	const initialMemberCount = use(initialMemberCountPromise);
	const [memberCount, setMemberCount] = useState(initialMemberCount);

	trpc.teams.members.simpleMemberListSubscription.useSubscription(team, {
		onData: (data) => setMemberCount(count(data, (member) => member.signedInAt !== undefined)),
	});

	switch (memberCount) {
		case 0:
			return 'No members signed in currently';
		case 1:
			return '1 member signed in';
		default:
			return `${memberCount} members signed in`;
	}
}
