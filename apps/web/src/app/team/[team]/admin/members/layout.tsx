import { MainContent } from '@/src/components/main-content';
import { PageHeader } from '@/src/components/page-header';
import type { PropsWithChildren } from 'react';

export default function AdminMembersPageLayout({ children }: PropsWithChildren) {
	return (
		<>
			<PageHeader title='Members' />
			<MainContent>{children}</MainContent>
		</>
	);
}
