import { AdminNavbar } from '@/src/components/admin/navbar/admin-navbar';
import { NeedsAdminAuthScreen } from '@/src/components/needs-admin-auth-screen';
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
	params: {
		team: string;
	};
}>;

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function AdminLayout({ children, params }: Props) {
	return (
		<>
			<AdminNavbar currentTeam={{ slug: params.team }} />
			<NeedsAdminAuthScreen className='pt-4'>{children}</NeedsAdminAuthScreen>
		</>
	);
}
