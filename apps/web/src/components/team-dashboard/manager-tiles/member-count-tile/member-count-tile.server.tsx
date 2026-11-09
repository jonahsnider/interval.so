import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { Suspense } from 'react';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { HydrateClient, loadMembersHandle } from '@/src/trpc/trpc-server';
import { MemberAvatars } from '../../member-avatars/member-avatars.server';
import { MemberCountTileInner } from './member-count-tile.client';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
};

// This is basically the same as LiveMemberCountTile but a different style
// ex. Header at bottom instead of top
export function MemberCountTile({ team }: Props) {
	return (
		<Card className='h-full w-full'>
			<CardHeader>
				<CardTitle>Signed-in members</CardTitle>
				<CardTitle className='text-3xl lg:text-4xl'>
					<Suspense fallback={<Skeleton className='h-9 lg:h-10 w-full' />}>
						<MemberCountTileFetcher team={team} />
					</Suspense>
				</CardTitle>
			</CardHeader>

			{/* Min height ensures that this doesn't grow the card by a tiny amount when the avatars are rendered */}
			<CardFooter className='sm:min-h-16'>
				<MemberAvatars team={team} />
			</CardFooter>
		</Card>
	);
}

async function MemberCountTileFetcher({ team }: Props) {
	const members = await loadMembersHandle(team.slug);

	return (
		<HydrateClient>
			<MemberCountTileInner membersHandle={members} />
		</HydrateClient>
	);
}
