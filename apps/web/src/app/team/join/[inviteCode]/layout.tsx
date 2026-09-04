import type { PropsWithChildren } from 'react';
import { Navbar } from '@/src/components/navbar/navbar';
import { FooterWrapper } from '@/src/components/page-wrappers/footer-wrapper';
import { MainContent } from '@/src/components/page-wrappers/main-content';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

type Props = PropsWithChildren<{
	params: Promise<{
		inviteCode: string;
	}>;
}>;

export default function TeamInviteLayout({ children }: Props) {
	return (
		<FooterWrapper>
			<Navbar />

			<MainContent className='items-center justify-center'>{children}</MainContent>
		</FooterWrapper>
	);
}
