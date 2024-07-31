import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Analytics } from '@vercel/analytics/react';
import clsx from 'clsx';
import type { Metadata, Viewport } from 'next';
import PlausibleProvider from 'next-plausible';
import { ThemeProvider } from 'next-themes';
import { ViewTransitions } from 'next-view-transitions';
import { Inter, Playfair_Display } from 'next/font/google';
import dotsStyles from '../components/dots/dots.module.css';
import { Footer } from '../components/footer/footer';
import '../globals.css';
import { TrpcProvider } from '../providers/trpc-provider';

export const metadata: Metadata = {
	title: 'Interval',
	description: 'Track meeting attendance.',
	metadataBase: new URL('https://interval.so'),
	openGraph: {
		url: 'https://interval.so',
		type: 'website',
		title: 'Interval',
		siteName: 'Interval',
		description: 'Track meeting attendance.',
	},
};

export const viewport: Viewport = {
	themeColor: [
		{
			media: '(prefers-color-scheme: dark)',
			color: '#101211',
		},
		{
			media: '(prefers-color-scheme: light)',
			color: '#ffffff',
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
						dotsStyles.dots,
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
