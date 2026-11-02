'use client';

import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import type { SimpleTeamMemberSchema } from '@interval.so/api/app/team_member/schemas/team_member_schema';
import { count } from '@jonahsnider/util';
import { Skeleton } from 'skullet/react';
import { Progress } from '@/components/ui/progress';
import { useLiveMembers } from '@/src/trpc/live-queries';
import { LiveMemberCountTileBase } from './live-member-count-tile.shared';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	members: SimpleTeamMemberSchema[];
};

const sampleData = { current: 24, max: 32 };

export function LiveMemberCountTileLoading() {
	return <LiveMemberCountTileContent data={sampleData} loading />;
}

export function LiveMemberCountTileClient({ team, members }: Props) {
	const { data = members } = useLiveMembers(team, members);
	return (
		<LiveMemberCountTileContent
			data={{ current: count(data, (member) => member.signedInAt !== undefined), max: data.length }}
		/>
	);
}

function LiveMemberCountTileContent({ data, loading = false }: { data: typeof sampleData; loading?: boolean }) {
	return (
		<Skeleton data={data} sample={sampleData} loading={loading} label='Loading signed-in members'>
			{({ current, max }) => (
				<LiveMemberCountTileBase
					value={`${current}/${max} members`}
					progressBar={<Progress value={current} max={max === 0 ? 1 : max} />}
				/>
			)}
		</Skeleton>
	);
}
