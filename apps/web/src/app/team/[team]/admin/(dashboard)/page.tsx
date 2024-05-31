import { GraphTabs } from '@/src/components/admin/dashboard/graphs/tabs/graph-tabs';
import { CombinedHoursTile } from '@/src/components/admin/dashboard/tiles/combined-hours-tile';
import { LiveMemberCountTile } from '@/src/components/admin/dashboard/tiles/live-member-count-tile';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function AdminPage() {
	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8'>
			<LiveMemberCountTile />
			<CombinedHoursTile />

			<div className='col-span-full'>
				<GraphTabs />
			</div>
		</div>
	);
}
