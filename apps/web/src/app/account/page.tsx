import { DeleteAccountCard } from '@/src/components/account/settings/delete-account-card';
import { DisplayNameCard } from '@/src/components/account/settings/display-name-card/display-name-card.server';
import { AccountSettingsLoading } from '@/src/components/account/settings/account-settings-loading';
import { AuthWall } from '@/src/components/auth-wall/auth-wall';

export default function ProfilePage() {
	return (
		<AuthWall kind='user' fallback={<AccountSettingsLoading />}>
			<div className='flex flex-col gap-4 max-w-3xl'>
				<DisplayNameCard />

				<DeleteAccountCard />
			</div>
		</AuthWall>
	);
}
