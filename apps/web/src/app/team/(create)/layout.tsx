import { MainContent } from '@/src/components/main-content';
import { Navbar } from '@/src/components/navbar/navbar';
import { PageHeader } from '@/src/components/page-header';
import type { PropsWithChildren } from 'react';

export default function TeamCreatePageLayout({ children }: PropsWithChildren) {
	return (
		<>
			<Navbar />

			<PageHeader title='Create a team' />

			<MainContent className='items-center'>{children}</MainContent>
		</>
	);
}
