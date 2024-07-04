import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { Suspense } from 'react';
import { MemberAvatarsClient } from './member-avatars.client';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
};

export function MemberAvatars({ team }: Props) {
	const membersPromise = trpcServer.teams.members.simpleMemberList
		.query(team)
		.then((members) => members.filter((member) => member.atMeeting));

	return (
		// No fallback, the avatars animate themselves on initial enter
		<Suspense>
			<MemberAvatarsClient membersPromise={membersPromise} team={team} />
		</Suspense>
	);
}
