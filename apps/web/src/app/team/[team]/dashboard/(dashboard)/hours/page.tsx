import { ManagerDashboardPageWrapper } from '@/src/components/manager/dashboard/manager-dashboard-page-wrapper';
import { searchParamCache } from '@/src/components/manager/dashboard/search-params';

type Props = {
	params: {
		team: string;
	};
	searchParams: { [key: string]: string | string[] | undefined };
};

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function ManagerPageHoursTab({ params, searchParams }: Props) {
	searchParamCache.parse(searchParams);

	return <ManagerDashboardPageWrapper team={{ slug: params.team }} graphTab='hours' />;
}
