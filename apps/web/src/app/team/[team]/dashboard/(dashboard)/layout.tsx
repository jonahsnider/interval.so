import type { PropsWithChildren } from 'react';
import { ManagerDashboardProvider } from '@/src/components/manager/dashboard/manager-dashboard-context';
import { ManagerDashboardPeriodSelect } from '@/src/components/manager/dashboard/period-select';
import { EndMeetingButton } from '@/src/components/manager/end-meeting-button/end-meeting-button';
import { PageHeader } from '@/src/components/page-header';
import { MainContent } from '@/src/components/page-wrappers/main-content';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

type Props = PropsWithChildren<{
	params: Promise<{
		team: string;
	}>;
}>;

export default async function ManagerDashboardLayout(props: Props) {
	const params = await props.params;

	const { children } = props;

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
