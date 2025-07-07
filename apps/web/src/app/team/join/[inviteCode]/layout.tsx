import type { PropsWithChildren } from 'react';
import { Navbar } from '@/src/components/navbar/navbar';
import { FooterWrapper } from '@/src/components/page-wrappers/footer-wrapper';
import { MainContent } from '@/src/components/page-wrappers/main-content';

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
