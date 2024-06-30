import { DeleteTeamCard } from '@/src/components/admin/settings/general/delete-team-card/delete-team-card.server';
import { LeaveTeamCard } from '@/src/components/admin/settings/general/leave-team-card';
import { TeamDisplayNameCard } from '@/src/components/admin/settings/general/team-display-name';
import { TeamPasswordCard } from '@/src/components/admin/settings/general/team-password';
import { TeamUrlCard } from '@/src/components/admin/settings/general/team-url-card';
import { AdminSettingsPageContainer } from '@/src/components/admin/settings/page-container';

type Props = {
	params: {
		team: string;
	};
};

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function AdminSettingsGeneralPage({ params }: Props) {
	const team = { slug: params.team };

	return (
		<AdminSettingsPageContainer team={team} pageId='general'>
			<div className='flex flex-col gap-4'>
				<TeamPasswordCard />

				<TeamDisplayNameCard />

				<TeamUrlCard />

				<LeaveTeamCard />

				<DeleteTeamCard team={team} />
			</div>
		</AdminSettingsPageContainer>
	);
}
