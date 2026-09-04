import type { PropsWithChildren } from 'react';
import { Navbar } from '@/src/components/navbar/navbar';
import { PageHeader } from '@/src/components/page-header';
import { FooterWrapper } from '@/src/components/page-wrappers/footer-wrapper';
import { MainContent } from '@/src/components/page-wrappers/main-content';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function AccountPageLayout({ children }: PropsWithChildren) {
	return (
		<FooterWrapper>
			<Navbar />

			<PageHeader title='Account settings' />

			<MainContent>{children}</MainContent>
		</FooterWrapper>
	);
}
