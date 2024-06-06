import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata, Viewport } from 'next';
import PlausibleProvider from 'next-plausible';
import { ThemeProvider } from 'next-themes';
import { ViewTransitions } from 'next-view-transitions';
import { Footer } from '../components/footer/footer';
import '../globals.css';
import { TrpcProvider } from '../providers/trpc-provider';

export const metadata: Metadata = {
	title: 'hours.frc.sh',
	description: 'Track meeting attendance.',
	metadataBase: new URL('https://hours.frc.sh'),
	openGraph: {
		url: 'https://hours.frc.sh',
		type: 'website',
		title: 'hours.frc.sh',
		siteName: 'shoursores.frc.sh',
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

// biome-ignore lint/style/noDefaultExport: This has to be a default export
export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<ViewTransitions>
			<html lang='en' className='bg-background' suppressHydrationWarning={true}>
				<head>
					<PlausibleProvider domain='hours.frc.sh' />
				</head>
				<body className='text-foreground bg-muted/40 antialiased'>
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
