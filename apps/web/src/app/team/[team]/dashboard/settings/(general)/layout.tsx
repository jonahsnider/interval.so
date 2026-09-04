import { type PropsWithChildren, Suspense } from 'react';
import { TeamSettingsPageContainer } from '@/src/components/manager/settings/page-container';

type Props = PropsWithChildren<{
	params: Promise<{
		team: string;
	}>;
}>;

async function TeamSettingsGeneralLayoutContent(props: Props) {
	const params = await props.params;

	const { children } = props;

	return (
		<TeamSettingsPageContainer team={{ slug: params.team }} pageId='general'>
			{children}
		</TeamSettingsPageContainer>
	);
}

export default function TeamSettingsGeneralLayout(props: Props) {
	return (
		<Suspense>
			<TeamSettingsGeneralLayoutContent {...props} />
		</Suspense>
	);
}
