'use client';

import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { count } from '@jonahsnider/util';
import { use } from 'react';
import { useLiveMembers } from '@/src/trpc/live-queries';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	initialMemberCountPromise: Promise<number>;
};

export function TeamCardDescription({ team, initialMemberCountPromise }: Props) {
	const initialMemberCount = use(initialMemberCountPromise);
	const { data: members } = useLiveMembers(team);
	const memberCount = members ? count(members, (member) => member.signedInAt !== undefined) : initialMemberCount;

	switch (memberCount) {
		case 0:
			return 'No members signed in currently';
		case 1:
			return '1 member signed in';
		default:
			return `${memberCount} members signed in`;
	}
}
