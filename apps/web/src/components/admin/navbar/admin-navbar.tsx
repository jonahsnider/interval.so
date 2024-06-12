import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { TeamPageNavbar } from '../../team-dashboard/navbar/team-page-navbar';
import { AdminNavbarInner } from './admin-navbar-inner';

type Props = {
	currentTeam?: Pick<TeamSchema, 'slug'>;
};

export function AdminNavbar({ currentTeam }: Props) {
	return (
		<TeamPageNavbar className='pb-0' currentTeam={currentTeam}>
			{currentTeam && <AdminNavbarInner team={currentTeam} />}
		</TeamPageNavbar>
	);
}
