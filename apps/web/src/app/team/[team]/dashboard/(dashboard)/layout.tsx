import { ManagerDashboardProvider } from '@/src/components/manager/dashboard/manager-dashboard-context';
import { ManagerDashboardPeriodSelect } from '@/src/components/manager/dashboard/period-select';
import { EndMeetingButton } from '@/src/components/manager/end-meeting-button/end-meeting-button';
import { PageHeader } from '@/src/components/page-header';
import { MainContent } from '@/src/components/page-wrappers/main-content';
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
	params: {
		team: string;
	};
}>;

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function ManagerDashboardLayout({ children, params }: Props) {
	const team = { slug: params.team };

	return (
		<ManagerDashboardProvider>
			<PageHeader title='Dashboard'>
				<div className='flex gap-4 sm:gap-8'>
					<EndMeetingButton team={team} />
					<ManagerDashboardPeriodSelect />
				</div>
			</PageHeader>
			<MainContent>{children}</MainContent>
		</ManagerDashboardProvider>
	);
}
