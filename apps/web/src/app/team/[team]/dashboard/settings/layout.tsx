import type { PropsWithChildren } from 'react';
import { PageHeader } from '@/src/components/page-header';
import { MainContent } from '@/src/components/page-wrappers/main-content';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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
