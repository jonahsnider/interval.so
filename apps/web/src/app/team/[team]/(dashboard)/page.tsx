import { AdminTiles } from '@/src/components/team-dashboard/admin-tiles/admin-tiles';
import { MembersTable } from '@/src/components/team-dashboard/members-table/members-table';
import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { Suspense } from 'react';

type Props = {
	params: {
		team: string;
	};
};

async function AdminTilesWrapper({ team }: { team: Pick<TeamSchema, 'slug'> }) {
	const { user } = await trpcServer.user.getSelf.query();

	if (user) {
		return <AdminTiles team={team} />;
	}

	return undefined;
}

// biome-ignore lint/style/noDefaultExport: This has to be a default export
export default async function HomePage({ params }: Props) {
	const initialMembers = await trpcServer.teams.members.simpleMemberList.query({ slug: params.team });

	// TODO: Make this stream - do the same strategy of a skeleton component, just a table with all the text set to skeletons + some dummy rows (also skeletons)

	return (
		<div className='flex w-full justify-center'>
			<div className='flex flex-col gap-4 justify-center items-center w-full pt-2'>
				{/* No fallback, we don't want to render a skeleton if the user is not signed in */}
				<Suspense>
					<AdminTilesWrapper team={{ slug: params.team }} />
				</Suspense>
				<MembersTable members={initialMembers} />
			</div>
		</div>
	);
}
