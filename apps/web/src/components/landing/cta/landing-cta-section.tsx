import clsx from 'clsx';
import { Link } from 'next-view-transitions';
import { buttonVariants } from '@/components/ui/button';
import styles from './cta.module.css';

export function LandingCtaSection() {
	return (
		<section
			className={clsx('w-full bg-[#111110] py-20 px-8 flex flex-col items-center justify-center gap-4', styles.cta)}
		>
			<h2 className='text-3xl sm:text-4xl font-serif font-semibold text-foreground text-center'>
				Get started with <span className='lowercase'>Interval</span>
			</h2>

			<div className='light'>
				<Link
					className={clsx('text-foreground text-lg', buttonVariants({ variant: 'outline', size: 'xl' }))}
					href='/signup'
				>
					Sign up
				</Link>
			</div>
		</section>
	);
}
