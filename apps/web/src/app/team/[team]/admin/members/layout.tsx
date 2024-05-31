import { MainContent } from '@/src/components/main-content';
import { PageHeader } from '@/src/components/page-header';
import type { PropsWithChildren } from 'react';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function AdminMembersPageLayout({ children }: PropsWithChildren) {
	return (
		<>
			<PageHeader title='Members' />
			<MainContent>{children}</MainContent>
		</>
	);
}
