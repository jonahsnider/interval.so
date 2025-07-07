import type { PropsWithChildren } from 'react';
import { FooterWrapper } from '@/src/components/page-wrappers/footer-wrapper';
import { TeamSlugProvider } from '@/src/components/team-dashboard/team-slug-provider';

type Props = PropsWithChildren<{
	params: Promise<{
		team: string;
	}>;
}>;

export default async function TeamPageLayout(props: Props) {
	const params = await props.params;

	const { children } = props;

	return (
		<FooterWrapper>
			<TeamSlugProvider team={{ slug: params.team }}>{children}</TeamSlugProvider>
		</FooterWrapper>
	);
}
