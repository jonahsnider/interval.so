import { Navbar } from '@/src/components/navbar/navbar';
import { FooterWrapper } from '@/src/components/page-wrappers/footer-wrapper';
import { MainContent } from '@/src/components/page-wrappers/main-content';

import { trpcServer } from '@/src/trpc/trpc-server';
import { captureException } from '@sentry/nextjs';
import { unstable_noStore as noStore } from 'next/cache';
import type { ReactNode } from 'react';

type Props = {
	authed: ReactNode;
	landing: ReactNode;
};

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default async function TeamSelectConditionalLayout({ authed, landing }: Props) {
	noStore();

	try {
		const { user } = await trpcServer.user.getSelf.query();

		if (user) {
			return (
				<FooterWrapper>
					<Navbar />

					<MainContent>{authed}</MainContent>
				</FooterWrapper>
			);
		}

		return landing;
	} catch (error) {
		captureException(error);
		return landing;
	}
}
