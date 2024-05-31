import { MainContent } from '@/src/components/main-content';
import { Navbar } from '@/src/components/navbar/navbar';
import { PageHeader } from '@/src/components/page-header';
import type { PropsWithChildren } from 'react';

export default function TeamInviteLayout({ children }: PropsWithChildren) {
	return (
		<>
			<Navbar />

			<PageHeader title='Join TEAM NAME' />

			<MainContent>{children}</MainContent>
		</>
	);
}
