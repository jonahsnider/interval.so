import { TeamPageNavbar } from '../../team-dashboard/navbar/team-page-navbar';
import { AdminNavbarInner } from './admin-navbar-inner';

export function AdminNavbar() {
	return (
		<TeamPageNavbar className='pb-0'>
			<AdminNavbarInner />
		</TeamPageNavbar>
	);
}
