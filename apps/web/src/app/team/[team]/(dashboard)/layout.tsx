import { MainContent } from '@/src/components/main-content';
import { NeedsSignedInScreen } from '@/src/components/needs-signed-in-screen';
import { TeamPageNavbar } from '@/src/components/team-dashboard/navbar/team-page-navbar';
import type { PropsWithChildren } from 'react';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function TeamLayout({ children }: PropsWithChildren) {
	return (
		<>
			<TeamPageNavbar />

			<MainContent>
				<NeedsSignedInScreen>{children}</NeedsSignedInScreen>
			</MainContent>
		</>
	);
}
