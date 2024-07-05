'use client';

import { Button } from '@/components/ui/button';
import { captureException } from '@sentry/nextjs';
import { useEffect } from 'react';
import { MainContent } from '../components/main-content';
import { BaseNavbar } from '../components/navbar/base-navbar';
import { PageHeader } from '../components/page-header';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function ErrorPage({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		captureException(error);
	}, [error]);

	return (
		<>
			<BaseNavbar />

			<PageHeader title='Error' />

			<MainContent className='items-center justify-center gap-4'>
				<p>An error occurred while rendering this page</p>

				<Button onClick={reset} className='max-w-min'>
					Reload
				</Button>
			</MainContent>
		</>
	);
}
