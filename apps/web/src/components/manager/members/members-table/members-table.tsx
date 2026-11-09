import 'server-only';

import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { ensureEntry, loadHandles } from '@trpc/tanstack-react-query/unstable-handles';
import { Suspense } from 'react';
import { HydrateClient, trpc } from '@/src/trpc/trpc-server';
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
	const [{ members }] = await loadHandles(trpc, {
		members: ensureEntry(trpc.teams.members.fullMemberList, team),
	});

	return (
		<HydrateClient>
			<MembersTableClient membersHandle={members} />
		</HydrateClient>
	);
}
