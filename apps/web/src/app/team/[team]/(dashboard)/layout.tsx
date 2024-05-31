import { MainContent } from '@/src/components/main-content';
import { TeamPageNavbar } from '@/src/components/team-dashboard/navbar/team-page-navbar';
import type { PropsWithChildren } from 'react';

export default function TeamLayout({ children }: PropsWithChildren) {
	return (
		<>
			<TeamPageNavbar />

			<MainContent>{children}</MainContent>
		</>
	);
}
