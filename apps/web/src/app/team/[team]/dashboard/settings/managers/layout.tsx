import { type PropsWithChildren, Suspense } from 'react';
import { TeamSettingsPageContainer } from '@/src/components/manager/settings/page-container';

type Props = PropsWithChildren<{
	params: Promise<{
		team: string;
	}>;
}>;

async function TeamSettingsManagersLayoutContent(props: Props) {
	const params = await props.params;

	const { children } = props;

	return (
		<TeamSettingsPageContainer team={{ slug: params.team }} pageId='managers'>
			{children}
		</TeamSettingsPageContainer>
	);
}

export default function TeamSettingsManagersLayout(props: Props) {
	return (
		<Suspense>
			<TeamSettingsManagersLayoutContent {...props} />
		</Suspense>
	);
}
