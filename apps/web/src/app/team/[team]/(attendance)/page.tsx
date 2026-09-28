import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { Suspense } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RouteContentLoading } from '@/src/components/route-loading';
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
		<div className='flex w-full justify-center'>
			<div className='flex flex-col gap-4 justify-center items-center w-full pt-2'>
				{/* No fallback, we don't want to render a skeleton if the user is not signed in */}
				<Suspense>
					<ManagerTilesWrapper team={{ slug: params.team }} />
				</Suspense>
				<Suspense fallback={<AttendanceTableLoading />}>
					<AttendanceTableFetcher team={team} />
				</Suspense>
			</div>
		</div>
	);
}

async function AttendanceTableFetcher({ team }: { team: Pick<TeamSchema, 'slug'> }) {
	const initialMembers = await getSimpleMemberList(team.slug);

	return <AttendanceTable initialData={initialMembers} team={team} />;
}

function AttendanceTableLoading() {
	return (
		<Card className='w-full md:max-w-xl'>
			<CardHeader>
				<Skeleton className='h-5 w-28' />
			</CardHeader>
			<CardContent className='flex gap-2'>
				<Skeleton className='h-9 flex-1' />
				<Skeleton className='h-9 w-24' />
			</CardContent>
			<CardContent className='flex flex-col gap-4'>
				{Array.from({ length: 6 }, (_, index) => (
					<Skeleton className='h-5 w-full' key={index} />
				))}
			</CardContent>
		</Card>
	);
}

export default function TeamAttendancePage(props: Props) {
	return (
		<Suspense fallback={<RouteContentLoading />}>
			<TeamAttendancePageContent {...props} />
		</Suspense>
	);
}
