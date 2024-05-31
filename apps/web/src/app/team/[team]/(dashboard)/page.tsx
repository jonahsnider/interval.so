import { AdminTiles } from '@/src/components/team-dashboard/admin-tiles/admin-tiles';
import { MembersTable } from '@/src/components/team-dashboard/members-table/members-table';

// biome-ignore lint/style/noDefaultExport: This has to be a default export
export default function HomePage() {
	const isAdmin = true;

	return (
		<div className='flex w-full justify-center'>
			<div className='flex flex-col gap-4 justify-center items-center w-full pt-2'>
				{isAdmin && <AdminTiles />}
				<MembersTable />
			</div>
		</div>
	);
}
