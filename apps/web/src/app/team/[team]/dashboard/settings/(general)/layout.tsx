import type { PropsWithChildren } from 'react';
import { TeamSettingsPageContainer } from '@/src/components/manager/settings/page-container';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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
