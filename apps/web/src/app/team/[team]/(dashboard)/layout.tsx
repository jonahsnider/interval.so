import { MainContent } from '@/src/components/main-content';
import { NeedsSignedInScreen } from '@/src/components/needs-signed-in-screen';
import { TeamPageNavbar } from '@/src/components/team-dashboard/navbar/team-page-navbar';
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
	params: {
		team: string;
	};
}>;

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function TeamLayout({ children, params }: Props) {
	return (
		<>
			<TeamPageNavbar currentTeam={{ slug: params.team }} />

			<MainContent>
				<NeedsSignedInScreen>{children}</NeedsSignedInScreen>
			</MainContent>
		</>
	);
}
