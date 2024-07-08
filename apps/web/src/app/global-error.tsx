'use client';

import * as Sentry from '@sentry/nextjs';
import NextError from 'next/error';
import { useEffect } from 'react';
import { isTrpcClientError } from '../trpc/common';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
	useEffect(() => {
		if (error instanceof AggregateError) {
			for (const childError of error.errors) {
				if (isTrpcClientError(childError)) {
					Sentry.addBreadcrumb({
						message: childError.message,
						data: {
							meta: childError.meta,
							data: childError.data,
						},
					});
				}
			}
		}

		if (isTrpcClientError(error)) {
			Sentry.captureException(error, {
				data: {
					meta: error.meta,
					data: error.data,
				},
			});
		} else {
			Sentry.captureException(error);
		}
	}, [error]);

	return (
		<html lang='en'>
			<body>
				{/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
				<NextError statusCode={0} />
			</body>
		</html>
	);
}
