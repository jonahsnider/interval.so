import { AuthWall } from '@/src/components/auth-wall/auth-wall';
import { Navbar } from '@/src/components/navbar/navbar';

import { PageHeader } from '@/src/components/page-header';
import { FooterWrapper } from '@/src/components/page-wrappers/footer-wrapper';
import { MainContent } from '@/src/components/page-wrappers/main-content';
import type { PropsWithChildren } from 'react';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function TeamCreatePageLayout({ children }: PropsWithChildren) {
	return (
		<FooterWrapper>
			<Navbar />

			<PageHeader title='Create a team' />

			<MainContent>
				<AuthWall kind='user'>{children}</AuthWall>
			</MainContent>
		</FooterWrapper>
	);
}
