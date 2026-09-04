import { ManagerDashboardPageWrapper } from '@/src/components/manager/dashboard/manager-dashboard-page-wrapper';
import { searchParamCache } from '@/src/components/manager/dashboard/search-params';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

type Props = {
	params: Promise<{
		team: string;
	}>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ManagerPageHoursTab(props: Props) {
	const searchParams = await props.searchParams;
	const params = await props.params;
	searchParamCache.parse(searchParams);

	return <ManagerDashboardPageWrapper team={{ slug: params.team }} graphTab='hours' />;
}
