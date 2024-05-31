import { AdminInviteLinkCard } from '@/src/components/admin/settings/admins/admin-invite-link-card';
import { AdminsTable } from '@/src/components/admin/settings/admins/admins-table-card';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function AdminSettingsAdminsPage() {
	return (
		<div className='flex flex-col gap-4'>
			<h1 className='text-2xl font-semibold'>Admins</h1>
			<p className='text-muted-foreground'>Manage admins and invitations</p>

			<AdminInviteLinkCard />

			<AdminsTable />
		</div>
	);
}
