import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { Suspense } from 'react';
import { HydrateClient, loadMembersHandle } from '@/src/trpc/trpc-server';
import { MemberAvatarsClient } from './member-avatars.client';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
};

export function MemberAvatars({ team }: Props) {
	return (
		<Suspense
			fallback={
				/* Minimum height matches the minimum height of the avatar container (which in turn matches the height of the avatars) */
				<div className='min-h-10' />
			}
		>
			<MemberAvatarsFetcher team={team} />
		</Suspense>
	);
}

async function MemberAvatarsFetcher({ team }: Props) {
	const members = await loadMembersHandle(team.slug);

	return (
		<HydrateClient>
			<MemberAvatarsClient membersHandle={members} />
		</HydrateClient>
	);
}
