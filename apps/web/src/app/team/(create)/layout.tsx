import { Navbar } from '@/src/components/navbar/navbar';
import { NeedsManagerAuthScreen } from '@/src/components/needs-manager-auth-screen';
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
				<NeedsManagerAuthScreen>{children}</NeedsManagerAuthScreen>
			</MainContent>
		</FooterWrapper>
	);
}
