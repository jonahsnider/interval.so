import { TeamSettingsPageContainer } from '@/src/components/manager/settings/page-container';
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
	params: Promise<{
		team: string;
	}>;
}>;

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default async function TeamSettingsManagersLayout(props: Props) {
	const params = await props.params;

	const { children } = props;

	return (
		<TeamSettingsPageContainer team={{ slug: params.team }} pageId='managers'>
			{children}
		</TeamSettingsPageContainer>
	);
}
