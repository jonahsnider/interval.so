import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SpeedInsights } from '@vercel/speed-insights/next';
import clsx from 'clsx';
import type { Metadata, Viewport } from 'next';
import PlausibleProvider from 'next-plausible';
import { ViewTransitions } from 'next-view-transitions';
import { Inter, Playfair_Display } from 'next/font/google';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import '../globals.css';
import { PostHogIdentityProvider } from '../providers/post-hog-identity-provider';
import { PostHogPageView } from '../providers/post-hog-page-view';
import { CsPostHogProvider } from '../providers/post-hog-provider';
import { PostHogTeamIdProvider } from '../providers/post-hog-team-id-provider';
import { SentryIdentityProvider } from '../providers/sentry-identity-provider';
import { TrpcProvider } from '../providers/trpc-provider';
import { siteMetadata } from '../site-metadata';

export const metadata: Metadata = {
	title: {
		absolute: siteMetadata.siteName,
		template: `%s | ${siteMetadata.siteName}`,
	},
	description: siteMetadata.description,
	metadataBase: siteMetadata.siteUrl,
	openGraph: {
		url: siteMetadata.siteUrl.toString(),
		type: 'website',
		title: siteMetadata.siteName,
		siteName: siteMetadata.siteName,
		description: siteMetadata.description,
	},
};

export const viewport: Viewport = {
	// The color is here "background", which matches the navbar color
	themeColor: [
		{
			media: '(prefers-color-scheme: dark)',
			color: '#111110',
		},
		{
			media: '(prefers-color-scheme: light)',
			color: '#fdfdfc',
		},
	],
	colorScheme: 'dark light',
};

const playfairDisplay = Playfair_Display({
	subsets: ['latin'],
	weight: 'variable',
	variable: '--font-playfair-display',
	display: 'swap',
});
const inter = Inter({ subsets: ['latin'], weight: 'variable', variable: '--font-inter', display: 'swap' });

// biome-ignore lint/style/noDefaultExport: This has to be a default export
export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<ViewTransitions>
			<html lang='en' className='bg-background' suppressHydrationWarning={true}>
				<CsPostHogProvider>
					<head>
						<PlausibleProvider domain='interval.so' />
					</head>
					<body
						className={clsx(
							'text-foreground bg-background-muted antialiased font-sans',
							inter.variable,
							playfairDisplay.variable,
						)}
					>
						<NuqsAdapter>
							<PostHogPageView />

							<TrpcProvider>
								<TooltipProvider>
									<PostHogIdentityProvider>
										<SentryIdentityProvider>
											<PostHogTeamIdProvider>{children}</PostHogTeamIdProvider>
										</SentryIdentityProvider>
									</PostHogIdentityProvider>
								</TooltipProvider>
							</TrpcProvider>

							<Toaster />
							<SpeedInsights />
						</NuqsAdapter>
					</body>
				</CsPostHogProvider>
			</html>
		</ViewTransitions>
	);
}
