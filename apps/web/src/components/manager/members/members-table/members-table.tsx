import 'server-only';

import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { Suspense } from 'react';
import { trpcServer } from '@/src/trpc/trpc-server';
import { MembersTableClient } from './members-table.client';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
};

export function MembersTable({ team }: Props) {
	return (
		<Suspense fallback={<MembersTableClient initialData={[]} loading={true} team={team} />}>
			<MembersTableFetcher team={team} />
		</Suspense>
	);
}

async function MembersTableFetcher({ team }: Props) {
	const data = await trpcServer.teams.members.fullMemberList.query(team);

	return <MembersTableClient initialData={data} loading={false} team={team} />;
}
