import { type PropsWithChildren, Suspense } from 'react';
import { FooterWrapper } from '@/src/components/page-wrappers/footer-wrapper';
import { TeamSlugProvider } from '@/src/components/team-dashboard/team-slug-provider';

type Props = PropsWithChildren<{
	params: Promise<{
		team: string;
	}>;
}>;

async function TeamPageContent(props: Props) {
	const params = await props.params;
	const { children } = props;

	return <TeamSlugProvider team={{ slug: params.team }}>{children}</TeamSlugProvider>;
}

export default function TeamPageLayout(props: Props) {
	return (
		<FooterWrapper>
			<Suspense>
				<TeamPageContent {...props} />
			</Suspense>
		</FooterWrapper>
	);
}
