import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SpeedInsights } from '@vercel/speed-insights/next';
import clsx from 'clsx';
import type { Metadata, Viewport } from 'next';
import PlausibleProvider from 'next-plausible';
import { ViewTransitions } from 'next-view-transitions';
import { Inter, Playfair_Display } from 'next/font/google';
import '../globals.css';
import dynamic from 'next/dynamic';
import { PostHogIdentityProvider } from '../providers/post-hog-identity-provider';
import { CsPostHogProvider } from '../providers/post-hog-provider';
import { PostHogTeamIdProvider } from '../providers/post-hog-team-id-provider';
import { TrpcProvider } from '../providers/trpc-provider';
import { siteMetadata } from '../site-metadata';

export const runtime = 'edge';

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

const PostHogPageView = dynamic(() => import('../providers/post-hog-page-view'), {
	ssr: false,
});

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
						<PostHogPageView />

						<TrpcProvider>
							<TooltipProvider>
								<PostHogIdentityProvider>
									<PostHogTeamIdProvider>{children}</PostHogTeamIdProvider>
								</PostHogIdentityProvider>
							</TooltipProvider>
						</TrpcProvider>

						<Toaster />
						<SpeedInsights />
					</body>
				</CsPostHogProvider>
			</html>
		</ViewTransitions>
	);
}
