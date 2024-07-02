import 'server-only';

import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { Suspense } from 'react';
import { MembersTableClient } from './members-table.client';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
};

export function MembersTable({ team }: Props) {
	return (
		<Suspense fallback={<MembersTableClient data={[]} loading={true} />}>
			<MembersTableFetcher team={team} />
		</Suspense>
	);
}

async function MembersTableFetcher({ team }: Props) {
	const data = await trpcServer.teams.members.fullMemberList.query(team);

	return <MembersTableClient data={data} loading={false} />;
}
