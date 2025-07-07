import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { trpcServer } from '@/src/trpc/trpc-server';
import { LiveMemberCountTileClient } from './live-member-count-tile.client';
import { LiveMemberCountTileBase } from './live-member-count-tile.shared';

type Props = { team: Pick<TeamSchema, 'slug'> };

export function LiveMemberCountTile({ team }: Props) {
	return (
		<Suspense fallback={<LiveMemberCountTileSkeleton />}>
			<LiveMemberCountTileFetcher team={team} />
		</Suspense>
	);
}

async function LiveMemberCountTileFetcher({ team }: Props) {
	const data = await trpcServer.teams.members.simpleMemberList.query({ slug: team.slug });

	return <LiveMemberCountTileClient team={team} members={data} />;
}

function LiveMemberCountTileSkeleton() {
	return (
		<LiveMemberCountTileBase
			value={<Skeleton className='w-60 h-10' />}
			progressBar={<Skeleton className='w-full h-2' />}
		/>
	);
}
