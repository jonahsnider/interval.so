import { PageHeader } from '@/src/components/page-header';
import { MainContent } from '@/src/components/page-wrappers/main-content';
import type { PropsWithChildren } from 'react';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function SettingsLayout({ children }: PropsWithChildren) {
	return (
		<>
			<PageHeader title='Team settings' />
			<MainContent className='pt-8'>
				<div className='grid grid-cols-4 gap-8'>{children}</div>
			</MainContent>
		</>
	);
}
