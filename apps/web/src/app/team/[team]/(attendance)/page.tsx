import { AttendanceTable } from '@/src/components/team-dashboard/attendance-table/attendance-table';
import { ManagerTiles } from '@/src/components/team-dashboard/manager-tiles/manager-tiles';
import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { Suspense } from 'react';

type Props = {
	params: {
		team: string;
	};
};

async function ManagerTilesWrapper({ team }: { team: Pick<TeamSchema, 'slug'> }) {
	const { user } = await trpcServer.user.getSelf.query();

	if (user) {
		return <ManagerTiles team={team} />;
	}

	return undefined;
}

// biome-ignore lint/style/noDefaultExport: This has to be a default export
export default async function TeamAttendancePage({ params }: Props) {
	const team = { slug: params.team };
	const initialMembers = await trpcServer.teams.members.simpleMemberList.query(team);

	// TODO: Make this stream - do the same strategy of a skeleton component, just a table with all the text set to skeletons + some dummy rows (also skeletons)

	return (
		<div className='flex w-full justify-center'>
			<div className='flex flex-col gap-4 justify-center items-center w-full pt-2'>
				{/* No fallback, we don't want to render a skeleton if the user is not signed in */}
				<Suspense>
					<ManagerTilesWrapper team={{ slug: params.team }} />
				</Suspense>
				<AttendanceTable initialData={initialMembers} team={team} />
			</div>
		</div>
	);
}
