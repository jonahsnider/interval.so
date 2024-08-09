import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Analytics } from '@vercel/analytics/react';
import clsx from 'clsx';
import type { Metadata, Viewport } from 'next';
import PlausibleProvider from 'next-plausible';
import { ThemeProvider } from 'next-themes';
import { ViewTransitions } from 'next-view-transitions';
import { Inter, Playfair_Display } from 'next/font/google';
import { Footer } from '../components/footer/footer';
import '../globals.css';
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
					<ThemeProvider attribute='class' defaultTheme='system' enableSystem={true} disableTransitionOnChange={true}>
						<TrpcProvider>
							<TooltipProvider>
								<div className='min-h-screen flex flex-col'>
									<div className='flex-1 w-full flex flex-col'>{children}</div>
									<Footer />
								</div>
							</TooltipProvider>
						</TrpcProvider>
					</ThemeProvider>

					<Toaster />

					<Analytics />
				</body>
			</html>
		</ViewTransitions>
	);
}
