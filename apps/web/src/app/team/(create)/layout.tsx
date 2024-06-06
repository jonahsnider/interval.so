import { MainContent } from '@/src/components/main-content';
import { Navbar } from '@/src/components/navbar/navbar';
import { NeedsSignedInScreen } from '@/src/components/needs-signed-in-screen';
import { PageHeader } from '@/src/components/page-header';
import type { PropsWithChildren } from 'react';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function TeamCreatePageLayout({ children }: PropsWithChildren) {
	return (
		<>
			<Navbar />

			<PageHeader title='Create a team' />

			<MainContent className='items-center'>
				<NeedsSignedInScreen>{children}</NeedsSignedInScreen>
			</MainContent>
		</>
	);
}
