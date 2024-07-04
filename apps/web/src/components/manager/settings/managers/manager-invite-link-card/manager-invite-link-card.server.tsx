import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyButtonInput } from '@/src/components/copy-button-input';
import { SettingsCardContentSkeleton, SettingsCardSkeleton } from '@/src/components/settings-card-skeleton';
import { trpcServer } from '@/src/trpc/trpc-server';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { Suspense } from 'react';
import { ManageInviteLinkCardButton } from './manager-invite-link-card.client';
import { inviteLinkUrl } from './shared';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
};

export function ManagerInviteLinkCard({ team }: Props) {
	return (
		<Suspense fallback={<SettingsCardSkeleton />}>
			<Outer team={team} />
		</Suspense>
	);
}

async function Outer({ team }: Props) {
	const teamManager = await trpcServer.teams.roleForSelf.query({ slug: team.slug });

	if (teamManager.role !== 'owner' && teamManager.role !== 'admin') {
		return undefined;
	}

	return <Inner team={team} />;
}

function Inner({ team }: Props) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Manager invite link</CardTitle>
				<CardDescription>Allow other people to join your team as editors through the link below.</CardDescription>
			</CardHeader>
			<Suspense fallback={<SettingsCardContentSkeleton className='w-[500px]' />}>
				<CardContent>
					<InviteLinkFieldFetcher team={team} />
				</CardContent>
			</Suspense>

			<CardFooter className='border-t px-6 py-4'>
				<ManageInviteLinkCardButton team={team} />
			</CardFooter>
		</Card>
	);
}

async function InviteLinkFieldFetcher({ team }: Props) {
	const dbTeam = await trpcServer.teams.getInviteCode.query(team);

	return <CopyButtonInput value={inviteLinkUrl(dbTeam)} editable={false} />;
}
