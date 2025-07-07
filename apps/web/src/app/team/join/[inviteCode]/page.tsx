import { JoinTeamCard } from '@/src/components/onboarding/team-invite/join-team-card';

type Props = {
	params: Promise<{
		inviteCode: string;
	}>;
};

export default async function TeamInvitePage(props: Props) {
	const params = await props.params;
	const inviteTeam = { inviteCode: params.inviteCode };

	return <JoinTeamCard team={inviteTeam} />;
}
