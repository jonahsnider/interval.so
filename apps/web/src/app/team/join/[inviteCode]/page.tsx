import { Suspense } from 'react';
import { JoinTeamCard } from '@/src/components/onboarding/team-invite/join-team-card';

type Props = {
	params: Promise<{
		inviteCode: string;
	}>;
};

async function TeamInvitePageContent(props: Props) {
	const params = await props.params;
	const inviteTeam = { inviteCode: params.inviteCode };

	return <JoinTeamCard team={inviteTeam} />;
}

export default function TeamInvitePage(props: Props) {
	return (
		<Suspense>
			<TeamInvitePageContent {...props} />
		</Suspense>
	);
}
