import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { Suspense } from 'react';
import { AuthWall } from '@/src/components/auth-wall/auth-wall';
import { AttendancePageLoading, AttendanceTableLoading } from '@/src/components/route-loading';
import { AttendanceTable } from '@/src/components/team-dashboard/attendance-table/attendance-table';
import { ManagerTiles } from '@/src/components/team-dashboard/manager-tiles/manager-tiles';
import { getSelf, getSimpleMemberList } from '@/src/trpc/trpc-server';

type Props = {
	params: Promise<{
		team: string;
	}>;
};

async function ManagerTilesWrapper({ team }: { team: Pick<TeamSchema, 'slug'> }) {
	const { user } = await getSelf();

	if (user) {
		return <ManagerTiles team={team} />;
	}

	return undefined;
}

async function TeamAttendancePageContent(props: Props) {
	const params = await props.params;
	const team = { slug: params.team };

	return (
		// Next.js renders pages independently of layouts, so gate the protected fetchers here too.
		<AuthWall kind='guestOrManager' wantedTeam={team} fallback={<AttendancePageLoading />}>
			<div className='flex w-full justify-center'>
				<div className='flex flex-col gap-4 justify-center items-center w-full pt-2'>
					{/* No fallback, we don't want to render a skeleton if the user is not signed in */}
					<Suspense>
						<ManagerTilesWrapper team={team} />
					</Suspense>
					<Suspense fallback={<AttendanceTableLoading />}>
						<AttendanceTableFetcher team={team} />
					</Suspense>
				</div>
			</div>
		</AuthWall>
	);
}

async function AttendanceTableFetcher({ team }: { team: Pick<TeamSchema, 'slug'> }) {
	const initialMembers = await getSimpleMemberList(team.slug);

	return <AttendanceTable initialData={initialMembers} team={team} />;
}

export default function TeamAttendancePage(props: Props) {
	return (
		<Suspense fallback={<AttendancePageLoading />}>
			<TeamAttendancePageContent {...props} />
		</Suspense>
	);
}
