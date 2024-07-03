import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';

export function inviteLinkUrl(team: Pick<TeamSchema, 'inviteCode'>): string {
	return `https://hours.frc.sh/teams/join/${team.inviteCode}`;
}
