'use client';

import { count } from '@jonahsnider/util';
import { Skeleton } from 'skullet/react';
import { Progress } from '@/components/ui/progress';
import { type MembersHandle, useLiveMembers } from '@/src/trpc/live-queries';
import { LiveMemberCountTileBase } from './live-member-count-tile.shared';

type Props = {
	membersHandle: MembersHandle;
};

const sampleData = { current: 24, max: 32 };

export function LiveMemberCountTileLoading() {
	return <LiveMemberCountTileContent data={sampleData} loading />;
}

export function LiveMemberCountTileClient({ membersHandle }: Props) {
	const { data } = useLiveMembers(membersHandle);
	if (!data) return <LiveMemberCountTileLoading />;
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
