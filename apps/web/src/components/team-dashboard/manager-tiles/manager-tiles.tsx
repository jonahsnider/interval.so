import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { ManageTile } from './manage-tile';
import { ManagerLinkTile } from './manager-link-tile';
import { MemberCountTile } from './member-count-tile/member-count-tile.server';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
};

export function ManagerTiles({ team }: Props) {
	return (
		<div className='w-full grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-4 justify-between max-w-4xl text-balance'>
			<ManageTile team={team} />
			<MemberCountTile team={team} />
			<ManagerLinkTile team={team} />
		</div>
	);
}
