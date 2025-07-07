import type { PropsWithChildren } from 'react';
import { AuthWall } from '@/src/components/auth-wall/auth-wall';
import { Navbar } from '@/src/components/navbar/navbar';
import { PageHeader } from '@/src/components/page-header';
import { FooterWrapper } from '@/src/components/page-wrappers/footer-wrapper';
import { MainContent } from '@/src/components/page-wrappers/main-content';

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
