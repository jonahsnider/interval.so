import { Navbar } from '@/src/components/navbar/navbar';
import { FooterWrapper } from '@/src/components/page-wrappers/footer-wrapper';
import { MainContent } from '@/src/components/page-wrappers/main-content';
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
	params: Promise<{
		inviteCode: string;
	}>;
}>;

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function TeamInviteLayout({ children }: Props) {
	return (
		<FooterWrapper>
			<Navbar />

			<MainContent className='items-center justify-center'>{children}</MainContent>
		</FooterWrapper>
	);
}
