import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { Suspense } from 'react';
import { HydrateClient, loadMembersHandle } from '@/src/trpc/trpc-server';
import { LiveMemberCountTileClient, LiveMemberCountTileLoading } from './live-member-count-tile.client';

type Props = { team: Pick<TeamSchema, 'slug'> };

export function LiveMemberCountTile({ team }: Props) {
	return (
		<Suspense fallback={<LiveMemberCountTileLoading />}>
			<LiveMemberCountTileFetcher team={team} />
		</Suspense>
	);
}

async function LiveMemberCountTileFetcher({ team }: Props) {
	const members = await loadMembersHandle(team.slug);

	return (
		<HydrateClient>
			<LiveMemberCountTileClient membersHandle={members} />
		</HydrateClient>
	);
}
