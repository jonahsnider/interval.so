import { AdminLinkTile } from './admin-link-tile';
import { ManageTile } from './manage-tile';
import { MemberCountTile } from './member-count-tile';

export function AdminTiles() {
	return (
		<div className='w-full grid grid-cols-1 sm:grid-cols-3 gap-4 justify-between max-w-4xl text-balance'>
			<ManageTile />
			<MemberCountTile />
			<AdminLinkTile />
		</div>
	);
}
