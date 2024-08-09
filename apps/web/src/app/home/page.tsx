import { Button, buttonVariants } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { LandingAttendanceSection } from '@/src/components/landing/attendance/landing-attendance-section';
import { LandingCtaSection } from '@/src/components/landing/cta/landing-cta-section';
import { HeroGraphic } from '@/src/components/landing/hero-graphic/hero-graphic';
import { LandingInsightsSection } from '@/src/components/landing/insights/landing-insights-section';
import { Navbar } from '@/src/components/navbar/navbar';
import { signupsEnabledFlag } from '@/src/flags';
import { siteMetadata } from '@/src/site-metadata';
import clsx from 'clsx';
import type { Metadata } from 'next';
import { Link } from 'next-view-transitions';
import dotsStyles from '../../components/dots/dots.module.css';

export const metadata: Metadata = {
	title: { absolute: siteMetadata.siteName },
	alternates: {
		canonical: '/home',
	},
};

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default async function LandingPage() {
	const signupsEnabled = await signupsEnabledFlag();

	return (
		<>
			<Navbar className='border-b-0 dark' />

			<section
				className={clsx(
					'flex flex-col items-center justify-center bg-[#111110] pt-8 pb-16 relative px-4 dark min-h-[85vh]',
					dotsStyles.dots,
				)}
			>
				<div className='w-full flex items-center justify-center'>
					<HeroGraphic className='pt-4 max-h-[80vh] bg-[#111110]' />
				</div>

				<div className='text-center flex flex-col gap-4 items-center justify-center absolute px-1'>
					<h1 className='font-serif text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-foreground'>
						A smarter sign-in sheet.
					</h1>

					<p className='text-lg md:text-xl lg:text-2xl text-muted-foreground text-balance max-w-2xl'>
						Interval combines a simple interface with powerful analytics for managing your team's attendance.
					</p>

					{signupsEnabled && (
						<Link
							className={clsx('text-foreground text-lg', buttonVariants({ variant: 'outline', size: 'xl' }))}
							href='/signup'
						>
							Sign up
						</Link>
					)}
					{!signupsEnabled && (
						<Tooltip>
							<TooltipTrigger asChild={true}>
								{/* biome-ignore lint/a11y/noNoninteractiveTabindex: This is interactive */}
								<span tabIndex={0}>
									<Button disabled={true} className='text-foreground text-lg' variant='outline' size='xl'>
										Sign up
									</Button>
								</span>
							</TooltipTrigger>

							<TooltipContent>
								<p className='text-sm'>Sign ups for Interval will be available soon</p>
							</TooltipContent>
						</Tooltip>
					)}
				</div>
			</section>

			<LandingAttendanceSection />

			<LandingInsightsSection />

			<LandingCtaSection />
		</>
	);
}
