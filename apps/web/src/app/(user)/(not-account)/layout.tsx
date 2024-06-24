import { MainContent } from '@/src/components/main-content';
import type { PropsWithChildren } from 'react';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function AuthPageLayout({ children }: PropsWithChildren) {
	return <MainContent>{children}</MainContent>;
}
