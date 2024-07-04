import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { count } from '@jonahsnider/util';
import { Suspense } from 'react';
import { MemberCountTileInner } from './member-count-tile.client';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
};

// This is basically the same as LiveMemberCountTile but a different style
// ex. Header at bottom instead of top
export function MemberCountTile({ team }: Props) {
	const dataPromise = trpcServer.teams.members.simpleMemberList
		.query({ slug: team.slug })
		.then((data) => count(data, (member) => member.atMeeting));

	return (
		<Card className='h-full w-full'>
			<CardHeader>
				<CardTitle>Signed-in members</CardTitle>
				<CardTitle className='text-3xl lg:text-4xl'>
					<Suspense fallback={<Skeleton className='h-9 lg:h-10 w-full' />}>
						<MemberCountTileInner team={team} initialMemberCountPromise={dataPromise} />
					</Suspense>
				</CardTitle>
			</CardHeader>
		</Card>
	);
}
