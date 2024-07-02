import { DeleteAccountCard } from '@/src/components/account/settings/delete-account-card';
import { DisplayNameCard } from '@/src/components/account/settings/display-name-card/display-name-card.server';
import { NeedsManagerAuthScreen } from '@/src/components/needs-manager-auth-screen';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function ProfilePage() {
	return (
		<NeedsManagerAuthScreen>
			<div className='flex flex-col gap-4 max-w-3xl'>
				<DisplayNameCard />

				<DeleteAccountCard />
			</div>
		</NeedsManagerAuthScreen>
	);
}
