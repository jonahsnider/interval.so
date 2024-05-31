import { MainContent } from '@/src/components/main-content';
import { PageHeader } from '@/src/components/page-header';
import type { PropsWithChildren } from 'react';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function AdminMeetingsPageLayout({ children }: PropsWithChildren) {
	return (
		<>
			<PageHeader title='Meetings' />
			<MainContent>{children}</MainContent>
		</>
	);
}
