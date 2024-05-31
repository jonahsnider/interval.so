import { MainContent } from '@/src/components/main-content';
import { Navbar } from '@/src/components/navbar/navbar';
import { PageHeader } from '@/src/components/page-header';
import type { PropsWithChildren } from 'react';

export default function AccountPageLayout({ children }: PropsWithChildren) {
	return (
		<>
			<Navbar />

			<PageHeader title='Account settings' />

			<MainContent>{children}</MainContent>
		</>
	);
}
