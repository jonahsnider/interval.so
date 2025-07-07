import type { PropsWithChildren } from 'react';
import { TeamSettingsPageContainer } from '@/src/components/manager/settings/page-container';

type Props = PropsWithChildren<{
	params: Promise<{
		team: string;
	}>;
}>;

export default async function TeamSettingsGeneralLayout(props: Props) {
	const params = await props.params;

	const { children } = props;

	return (
		<TeamSettingsPageContainer team={{ slug: params.team }} pageId='general'>
			{children}
		</TeamSettingsPageContainer>
	);
}
