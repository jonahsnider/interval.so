import Image from 'next/image';
import screenshot from './screenshot.png';

export function LandingInsightsSection() {
	return (
		<section className='bg-background-muted dark py-16'>
			<div className='mx-auto container flex flex-col-reverse items-center lg:items-start lg:flex-row lg:justify-between gap-8 text-foreground'>
				<Image
					src={screenshot}
					width={768}
					objectFit='cover'
					alt='A screenshot of the Interval dashboard on a laptop'
					quality={90}
				/>

				<div className='flex flex-col max-w-xl'>
					<h2 className='font-serif font-semibold text-3xl sm:text-4xl md:text-5xl pb-4'>Effortless insights.</h2>
					<p className='md:text-lg lg:text-xl'>
						Take advantage of Interval's analytics features to identify your most active members, view historical data,
						and observe trends in meeting attendance.
					</p>
				</div>
			</div>
		</section>
	);
}
