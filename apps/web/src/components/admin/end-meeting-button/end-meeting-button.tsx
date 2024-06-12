import { Skeleton } from '@/components/ui/skeleton';
import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import clsx from 'clsx';
import { Suspense } from 'react';
import { EndMeetingButtonClient } from './end-meeting-button.client';

type Props = {
	width?: 'full' | 'auto';
	team: Pick<TeamSchema, 'slug'>;
};

async function EndMeetingButtonFetcher({ width, team }: Props) {
	const members = await trpcServer.teams.members.simpleMemberList.query({ slug: team.slug });

	const enabled = members.some((member) => member.atMeeting);

	return <EndMeetingButtonClient width={width} enabled={enabled} team={team} />;
}

function EndMeetingButtonSkeleton({ width }: { width?: 'full' | 'auto' }) {
	return (
		<Skeleton
			className={clsx('h-9', {
				'w-full': width === 'full',
				'w-28': width !== 'full',
			})}
		/>
	);
}

export function EndMeetingButton({ width, team }: Props) {
	return (
		<Suspense fallback={<EndMeetingButtonSkeleton width={width} />}>
			<EndMeetingButtonFetcher width={width} team={team} />
		</Suspense>
	);
}
