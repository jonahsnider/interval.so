import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { AdminLinkTile } from './admin-link-tile';
import { ManageTile } from './manage-tile';
import { MemberCountTile } from './member-count-tile';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
};

export function AdminTiles({ team }: Props) {
	return (
		<div className='w-full grid grid-cols-1 sm:grid-cols-3 gap-4 justify-between max-w-4xl text-balance'>
			<ManageTile team={team} />
			<MemberCountTile team={team} />
			<AdminLinkTile team={team} />
		</div>
	);
}
