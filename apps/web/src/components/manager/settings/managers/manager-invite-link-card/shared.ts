import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';

export function inviteLinkUrl(team: Pick<TeamSchema, 'inviteCode'>): string {
	return `https://interval.so/team/join/${team.inviteCode}`;
}
