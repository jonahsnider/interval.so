import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import type { PropsWithChildren } from 'react';
import { SettingsSidebar, type SidebarEntryId } from './settings-sidebar';

type Props = PropsWithChildren<{
	team: Pick<TeamSchema, 'slug'>;
	pageId: SidebarEntryId;
}>;

export function AdminSettingsPageContainer({ team, children, pageId }: Props) {
	return (
		<>
			<div className='col-span-full sm:col-span-1 [view-transition-name:team-settings-sidebar]'>
				<SettingsSidebar team={team} pageId={pageId} />
			</div>

			<div className='col-span-full sm:col-span-3 [view-transition-name:team-settings-content]'>{children}</div>
		</>
	);
}
