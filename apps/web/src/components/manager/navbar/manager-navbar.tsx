import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { Navbar } from '../../navbar/navbar';
import { ManagerNavbarInner } from './manager-navbar-inner';

type Props = {
	currentTeam?: Pick<TeamSchema, 'slug'>;
};

export function ManagerNavbar({ currentTeam }: Props) {
	return (
		<Navbar className='pb-0' currentTeam={currentTeam}>
			{currentTeam && <ManagerNavbarInner team={currentTeam} />}
		</Navbar>
	);
}
