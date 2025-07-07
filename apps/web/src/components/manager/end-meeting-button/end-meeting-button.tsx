import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import clsx from 'clsx';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { trpcServer } from '@/src/trpc/trpc-server';
import { EndMeetingButtonClient } from './end-meeting-button.client';

type Props = {
	width?: 'full' | 'auto';
	team: Pick<TeamSchema, 'slug'>;
};

export function EndMeetingButton({ width, team }: Props) {
	const enabled = trpcServer.teams.members.simpleMemberList
		.query({ slug: team.slug })
		.then((members) => members.some((member) => member.signedInAt));
	const meetingStart = trpcServer.teams.meetings.getCurrentMeetingStart.query(team);

	return (
		<Suspense
			fallback={
				<Skeleton
					className={clsx('h-9', {
						'w-full': width === 'full',
						'w-28': width !== 'full',
					})}
				/>
			}
		>
			<EndMeetingButtonClient width={width} enabledPromise={enabled} team={team} meetingStartPromise={meetingStart} />
		</Suspense>
	);
}
