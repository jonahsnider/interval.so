import { type PropsWithChildren, Suspense, ViewTransition } from 'react';
import { SettingsSidebar } from '@/src/components/manager/settings/settings-sidebar';
import { PageHeader } from '@/src/components/page-header';
import { MainContent } from '@/src/components/page-wrappers/main-content';
import { SettingsSidebarLoading } from '@/src/components/route-loading';

export default function SettingsLayout({ children }: PropsWithChildren) {
	return (
		<>
			<PageHeader title='Team settings' />
			<MainContent className='pt-8' transition={false}>
				<div className='grid grid-cols-4 gap-8'>
					<div className='col-span-full md:col-span-1'>
						<Suspense fallback={<SettingsSidebarLoading />}>
							<SettingsSidebar />
						</Suspense>
					</div>
					<ViewTransition name='team-settings-content'>
						<div className='col-span-full md:col-span-3'>{children}</div>
					</ViewTransition>
				</div>
			</MainContent>
		</>
	);
}
