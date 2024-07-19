import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import type { PropsWithChildren } from 'react';
import { SettingsSidebar, type SidebarEntryId } from './settings-sidebar';

type Props = PropsWithChildren<{
	team: Pick<TeamSchema, 'slug'>;
	pageId: SidebarEntryId;
}>;

export function TeamSettingsPageContainer({ team, children, pageId }: Props) {
	return (
		<>
			<div className='col-span-full md:col-span-1 [view-transition-name:team-settings-sidebar]'>
				<SettingsSidebar team={team} pageId={pageId} />
			</div>

			<div className='col-span-full md:col-span-3 [view-transition-name:team-settings-content]'>{children}</div>
		</>
	);
}
