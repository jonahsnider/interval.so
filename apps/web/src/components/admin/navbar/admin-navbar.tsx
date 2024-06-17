import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { Navbar } from '../../navbar/navbar';
import { AdminNavbarInner } from './admin-navbar-inner';

type Props = {
	currentTeam?: Pick<TeamSchema, 'slug'>;
};

export function AdminNavbar({ currentTeam }: Props) {
	return (
		<Navbar className='pb-0' currentTeam={currentTeam}>
			{currentTeam && <AdminNavbarInner team={currentTeam} />}
		</Navbar>
	);
}
