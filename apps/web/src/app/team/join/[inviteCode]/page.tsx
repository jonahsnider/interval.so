import { JoinTeamCard } from '@/src/components/onboarding/team-invite/join-team-card';

type Props = {
	params: {
		inviteCode: string;
	};
};

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default async function TeamInvitePage({ params }: Props) {
	const inviteTeam = { inviteCode: params.inviteCode };

	return <JoinTeamCard team={inviteTeam} />;
}
