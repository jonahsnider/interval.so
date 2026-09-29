import type { PropsWithChildren } from 'react';
import { FooterWrapper } from '@/src/components/page-wrappers/footer-wrapper';

export default function TeamPageLayout({ children }: PropsWithChildren) {
	return <FooterWrapper>{children}</FooterWrapper>;
}
