import { ManagerDashboardPageWrapper } from '@/src/components/manager/dashboard/manager-dashboard-page-wrapper';
import { searchParamCache } from '@/src/components/manager/dashboard/search-params';

type Props = {
	params: Promise<{
		team: string;
	}>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default async function ManagerPageMembersTab(props: Props) {
	const searchParams = await props.searchParams;
	const params = await props.params;
	searchParamCache.parse(searchParams);

	return <ManagerDashboardPageWrapper team={{ slug: params.team }} graphTab='members' />;
}
