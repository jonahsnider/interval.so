'use client';

import { captureException } from '@sentry/nextjs';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BaseNavbar } from '../components/navbar/base-navbar';
import { PageHeader } from '../components/page-header';
import { FooterWrapper } from '../components/page-wrappers/footer-wrapper';
import { MainContent } from '../components/page-wrappers/main-content';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		captureException(error);
	}, [error]);

	return (
		<FooterWrapper>
			<BaseNavbar />

			<PageHeader title='Error' />

			<MainContent className='items-center justify-center gap-4'>
				<p>An error occurred while rendering this page</p>

				<Button onClick={reset} className='max-w-min'>
					Reload
				</Button>
			</MainContent>
		</FooterWrapper>
	);
}
