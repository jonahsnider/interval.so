import { DeleteTeamCard } from '@/src/components/admin/settings/general/delete-team-card';
import { LeaveTeamCard } from '@/src/components/admin/settings/general/leave-team-card';
import { TeamDisplayNameCard } from '@/src/components/admin/settings/general/team-display-name';
import { TeamPasswordCard } from '@/src/components/admin/settings/general/team-password';
import { TeamUrlCard } from '@/src/components/admin/settings/general/team-url-card';

export default function AdminSettingsGeneralPage() {
	return (
		<div className='flex flex-col gap-4'>
			<TeamPasswordCard />

			<TeamDisplayNameCard />

			<TeamUrlCard />

			<LeaveTeamCard />

			<DeleteTeamCard />
		</div>
	);
}
