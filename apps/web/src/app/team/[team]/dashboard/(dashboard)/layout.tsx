import { type PropsWithChildren, Suspense } from 'react';
import { ManagerDashboardProvider } from '@/src/components/manager/dashboard/manager-dashboard-context';
import { ManagerDashboardPeriodSelect } from '@/src/components/manager/dashboard/period-select';
import { EndMeetingButton } from '@/src/components/manager/end-meeting-button/end-meeting-button';
import { PageHeader } from '@/src/components/page-header';
import { MainContent } from '@/src/components/page-wrappers/main-content';
import { DashboardActionsLoading } from '@/src/components/route-loading';

type Props = PropsWithChildren<{
	params: Promise<{
		team: string;
	}>;
}>;

async function ManagerDashboardActions({ params }: Pick<Props, 'params'>) {
	const { team: teamSlug } = await params;
	const team = { slug: teamSlug };

	return (
		<div className='flex gap-4 sm:gap-8'>
			<EndMeetingButton team={team} />
			<ManagerDashboardPeriodSelect />
		</div>
	);
}

export default function ManagerDashboardLayout({ children, params }: Props) {
	return (
		<ManagerDashboardProvider>
			<PageHeader title='Dashboard'>
				<Suspense fallback={<DashboardActionsLoading />}>
					<ManagerDashboardActions params={params} />
				</Suspense>
			</PageHeader>
			<MainContent>{children}</MainContent>
		</ManagerDashboardProvider>
	);
}
