import { DeleteTeamCard } from '@/src/components/manager/settings/general/delete-team-card/delete-team-card.server';
import { LeaveTeamCard } from '@/src/components/manager/settings/general/leave-team-card/leave-team-card.server';
import { TeamDisplayNameCard } from '@/src/components/manager/settings/general/team-display-name';
import { TeamPasswordCard } from '@/src/components/manager/settings/general/team-password-card/team-password-card.server';
import { TeamUrlCard } from '@/src/components/manager/settings/general/team-url-card';

type Props = {
	params: {
		team: string;
	};
};

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function TeamSettingsGeneralPage({ params }: Props) {
	const team = { slug: params.team };

	return (
		<div className='flex flex-col gap-4'>
			<TeamPasswordCard team={team} />

			<TeamDisplayNameCard />

			<TeamUrlCard />

			<LeaveTeamCard team={team} />

			<DeleteTeamCard team={team} />
		</div>
	);
}
