import { Button, buttonVariants } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { signupsEnabledFlag } from '@/src/flags';
import clsx from 'clsx';
import { Link } from 'next-view-transitions';
import styles from './cta.module.css';

export async function LandingCtaSection() {
	const signupsEnabled = await signupsEnabledFlag();

	return (
		<section
			className={clsx('w-full bg-[#111110] py-20 px-8 flex flex-col items-center justify-center gap-4', styles.cta)}
		>
			<h2 className='text-3xl sm:text-4xl font-serif font-semibold text-foreground text-center'>
				Get started with <span className='lowercase'>Interval</span>
			</h2>

			<div className={clsx('light', { 'bg-[#111110]': !signupsEnabled })}>
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
	);
}
