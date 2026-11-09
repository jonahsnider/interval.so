import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { ensureEntry, loadHandles } from '@trpc/tanstack-react-query/unstable-handles';
import clsx from 'clsx';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { HydrateClient, trpc } from '@/src/trpc/trpc-server';
import { EndMeetingButtonClient } from './end-meeting-button.client';

type Props = {
	width?: 'full' | 'auto';
	team: Pick<TeamSchema, 'slug'>;
};

export function EndMeetingButton({ width, team }: Props) {
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
			<EndMeetingButtonFetcher width={width} team={team} />
		</Suspense>
	);
}

async function EndMeetingButtonFetcher({ width, team }: Props) {
	const [{ members, meetingStart }] = await loadHandles(trpc, {
		members: ensureEntry(trpc.teams.members.simpleMemberList, { slug: team.slug }),
		meetingStart: ensureEntry(trpc.teams.meetings.getCurrentMeetingStart, team),
	});

	return (
		<HydrateClient>
			<EndMeetingButtonClient width={width} membersHandle={members} meetingStartHandle={meetingStart} />
		</HydrateClient>
	);
}
