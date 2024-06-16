import { DeleteAccountCard } from '@/src/components/account/settings/delete-account-card';
import { DisplayNameCard } from '@/src/components/account/settings/display-name-card/display-name-card.server';
import { NeedsAdminAuthScreen } from '@/src/components/needs-admin-auth-screen';

export const dynamic = 'force-dynamic';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function ProfilePage() {
	return (
		<NeedsAdminAuthScreen>
			<div className='flex flex-col gap-4 max-w-3xl'>
				<DisplayNameCard />

				<DeleteAccountCard />
			</div>
		</NeedsAdminAuthScreen>
	);
}
