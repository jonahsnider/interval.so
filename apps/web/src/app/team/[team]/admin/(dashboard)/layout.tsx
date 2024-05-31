import { AdminDashboardProvider } from '@/src/components/admin/dashboard/admin-dashboard-context';
import { AdminDashboardPeriodSelect } from '@/src/components/admin/dashboard/period-select';
import { EndMeetingButton } from '@/src/components/admin/end-meeting-button';
import { MainContent } from '@/src/components/main-content';
import { PageHeader } from '@/src/components/page-header';
import type { PropsWithChildren } from 'react';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function AdminDashboardLayout({ children }: PropsWithChildren) {
	return (
		<AdminDashboardProvider>
			<PageHeader title='Dashboard' className='flex items-end'>
				<div className='flex gap-8'>
					<EndMeetingButton />
					<AdminDashboardPeriodSelect />
				</div>
			</PageHeader>
			<MainContent>{children}</MainContent>
		</AdminDashboardProvider>
	);
}
