import Image from 'next/image';
import screenshot from './screenshot.png';

export function LandingAttendanceSection() {
	return (
		<section className='p-6 pt-2 bg-gradient-to-b from-[#111110] to-background-muted justify-center flex items-center'>
			<div className='rounded-[2rem] overflow-hidden bg-[#F1F0EF] text-[#21201C] mx-auto max-w-6xl container'>
				<div className='mx-auto container flex flex-col items-center lg:items-start lg:flex-row lg:justify-between gap-4 lg:gap-8'>
					<div className='flex flex-col max-w-xl pt-6 md:pt-8 lg:pt-16'>
						<h2 className='font-serif font-semibold text-3xl sm:text-4xl md:text-5xl pb-4'>Attendance your way.</h2>
						<p className='md:text-lg lg:text-xl'>Interval lets you manage attendance how you like.</p>
						<p className='md:text-lg lg:text-xl'>
							Share a sign-in link, use a dedicated attendance device, or invite specific users to manage attendance.
						</p>
					</div>

					<Image
						alt='A screenshot of the Interval attendance form on a smartphone'
						src={screenshot}
						height={640}
						className='lg:pt-16'
						quality={95}
					/>
				</div>
			</div>
		</section>
	);
}
