import { AdminDashboardProvider } from '@/src/components/admin/dashboard/admin-dashboard-context';
import { AdminDashboardPeriodSelect } from '@/src/components/admin/dashboard/period-select';
import { EndMeetingButton } from '@/src/components/admin/end-meeting-button/end-meeting-button';
import { MainContent } from '@/src/components/main-content';
import { PageHeader } from '@/src/components/page-header';
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
	params: {
		team: string;
	};
}>;

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function AdminDashboardLayout({ children, params }: Props) {
	const team = { slug: params.team };

	return (
		<AdminDashboardProvider>
			<PageHeader title='Dashboard'>
				<div className='flex gap-4 sm:gap-8'>
					<EndMeetingButton team={team} />
					<AdminDashboardPeriodSelect />
				</div>
			</PageHeader>
			<MainContent>{children}</MainContent>
		</AdminDashboardProvider>
	);
}
