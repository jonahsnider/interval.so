import { ManagerInviteLinkCard } from '@/src/components/admin/settings/managers/manager-invite-link-card';
import { ManagersTableCard } from '@/src/components/admin/settings/managers/managers-table-card';

type Props = {
	params: {
		team: string;
	};
};

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function TeamSettingsManagersPage({ params }: Props) {
	return (
		<div className='flex flex-col gap-4'>
			<h1 className='text-2xl font-semibold'>Managers</h1>
			<p className='text-muted-foreground'>Modify managers and invitations</p>

			<ManagerInviteLinkCard />

			<ManagersTableCard />
		</div>
	);
}
