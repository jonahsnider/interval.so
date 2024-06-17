import { AdminDashboardPageWrapper } from '@/src/components/admin/dashboard/admin-dashboard-page-wrapper';
import { searchParamCache } from '@/src/components/admin/dashboard/search-params';

type Props = {
	params: {
		team: string;
	};
	searchParams: { [key: string]: string | string[] | undefined };
};

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function AdminPageHoursTab({ params, searchParams }: Props) {
	searchParamCache.parse(searchParams);

	return <AdminDashboardPageWrapper team={{ slug: params.team }} graphTab='hours' />;
}
