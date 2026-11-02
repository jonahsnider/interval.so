import 'server-only';

import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { Suspense } from 'react';
import { trpcServer } from '@/src/trpc/trpc-server';
import { MembersTableClient, MembersTableLoading } from './members-table.client';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
};

export function MembersTable({ team }: Props) {
	return (
		<Suspense fallback={<MembersTableLoading />}>
			<MembersTableFetcher team={team} />
		</Suspense>
	);
}

async function MembersTableFetcher({ team }: Props) {
	const data = await trpcServer.teams.members.fullMemberList.query(team);

	return <MembersTableClient initialData={data} team={team} />;
}
