import { GraphTabs } from '@/src/components/admin/dashboard/graphs/tabs/graph-tabs';

type Props = {
	params: {
		team: string;
	};
};

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function AdminPageMembersTab({ params }: Props) {
	return <GraphTabs team={{ slug: params.team }} selected='members' />;
}
