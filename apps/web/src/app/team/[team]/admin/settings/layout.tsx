import { SettingsSidebar } from '@/src/components/admin/settings/settings-sidebar';
import { MainContent } from '@/src/components/main-content';
import { PageHeader } from '@/src/components/page-header';
import type { PropsWithChildren } from 'react';

export default function SettingsLayout({ children }: PropsWithChildren) {
	return (
		<>
			<PageHeader title='Team settings' />
			<MainContent className='pt-8'>
				<div className='grid grid-cols-4 gap-8'>
					<div className='col-span-full sm:col-span-1 [view-transition-name:team-settings-sidebar]'>
						<SettingsSidebar />
					</div>

					<div className='col-span-full sm:col-span-3 [view-transition-name:team-settings-content]'>{children}</div>
				</div>
			</MainContent>
		</>
	);
}
