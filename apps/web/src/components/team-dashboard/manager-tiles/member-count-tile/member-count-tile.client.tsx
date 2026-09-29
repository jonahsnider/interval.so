'use client';

import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { count } from '@jonahsnider/util';
import { use } from 'react';
import { useSubscription } from '@trpc/tanstack-react-query';
import { useTRPC } from '@/src/trpc/trpc-client';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	initialMemberCountPromise: Promise<number>;
};

export function MemberCountTileInner({ team, initialMemberCountPromise }: Props) {
	const trpc = useTRPC();
	const initialMemberCount = use(initialMemberCountPromise);
	const { data: members } = useSubscription(trpc.teams.members.simpleMemberListSubscription.subscriptionOptions(team));
	const memberCount = members ? count(members, (member) => member.signedInAt !== undefined) : initialMemberCount;

	return (
		<>
			{memberCount} member{memberCount !== 1 && 's'}
		</>
	);
}
