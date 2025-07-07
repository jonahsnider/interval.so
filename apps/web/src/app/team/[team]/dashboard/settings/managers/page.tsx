import { ManagerInviteLinkCard } from '@/src/components/manager/settings/managers/manager-invite-link-card/manager-invite-link-card.server';
import { ManagersTableCard } from '@/src/components/manager/settings/managers/managers-table-card/managers-table-card.server';

type Props = {
	params: Promise<{
		team: string;
	}>;
};

export default async function TeamSettingsManagersPage(props: Props) {
	const params = await props.params;
	const team = { slug: params.team };

	return (
		<div className='flex flex-col gap-4'>
			<h1 className='text-2xl font-semibold'>Managers</h1>
			<p className='text-muted-foreground'>Modify managers and invitations</p>

			<ManagerInviteLinkCard team={team} />

			<ManagersTableCard team={team} />
		</div>
	);
}
