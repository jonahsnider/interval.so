import { ManagerNavbar } from '@/src/components/manager/navbar/manager-navbar';
import { NeedsManagerAuthScreen } from '@/src/components/needs-manager-auth-screen';
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
	params: {
		team: string;
	};
}>;

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function ManagerLayout({ children, params }: Props) {
	return (
		<>
			<ManagerNavbar currentTeam={{ slug: params.team }} />
			<NeedsManagerAuthScreen className='pt-4'>{children}</NeedsManagerAuthScreen>
		</>
	);
}
