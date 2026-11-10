import { Suspense } from 'react';
import { ManagerDashboardPageWrapper } from '@/src/components/manager/dashboard/manager-dashboard-page-wrapper';
import { searchParamCache } from '@/src/components/manager/dashboard/search-params';

type Props = {
	params: Promise<{
		team: string;
	}>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

async function ManagerDashboardContent(props: Props) {
	const [searchParams, params] = await Promise.all([props.searchParams, props.params]);
	searchParamCache.parse(searchParams);

	return <ManagerDashboardPageWrapper team={{ slug: params.team }} />;
}

export default function ManagerDashboardPage(props: Props) {
	return (
		<Suspense>
			<ManagerDashboardContent {...props} />
		</Suspense>
	);
}
