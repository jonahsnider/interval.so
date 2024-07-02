import { TeamSettingsPageContainer } from '@/src/components/manager/settings/page-container';
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
	params: {
		team: string;
	};
}>;

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function TeamSettingsManagersLayout({ children, params }: Props) {
	return (
		<TeamSettingsPageContainer team={{ slug: params.team }} pageId='managers'>
			{children}
		</TeamSettingsPageContainer>
	);
}
