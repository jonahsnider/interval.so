import { MainContent } from '@/src/components/main-content';
import { TeamPageNavbar } from '@/src/components/team-dashboard/navbar/team-page-navbar';
import type { PropsWithChildren } from 'react';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function UserPageLayout({ children }: PropsWithChildren) {
	return (
		<>
			{/* Gives users an easy way to navigate to the team dashboard from home page */}
			<TeamPageNavbar />

			<MainContent>{children}</MainContent>
		</>
	);
}
