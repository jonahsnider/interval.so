'use client';

import { Progress } from '@/components/ui/progress';
import { trpc } from '@/src/trpc/trpc-client';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import type { SimpleTeamMemberSchema } from '@hours.frc.sh/api/app/team_member/schemas/team_member_schema';
import { count } from '@jonahsnider/util';
import { useState } from 'react';
import { LiveMemberCountTileBase } from './live-member-count-tile.shared';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	members: SimpleTeamMemberSchema[];
};

export function LiveMemberCoutnTileClient({ team, members }: Props) {
	const [data, setData] = useState<SimpleTeamMemberSchema[]>(members);

	trpc.teams.members.simpleMemberListSubscription.useSubscription(team, { onData: setData });

	const current = count(data, (member) => member.signedInAt !== undefined);
	const max = data.length;

	return (
		<LiveMemberCountTileBase
			value={`${current}/${max} members`}
			progressBar={<Progress value={current} max={max === 0 ? 1 : max} />}
		/>
	);
}
