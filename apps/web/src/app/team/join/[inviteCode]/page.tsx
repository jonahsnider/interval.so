import { JoinTeamCard } from '@/src/components/onboarding/team-invite/join-team-card';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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
