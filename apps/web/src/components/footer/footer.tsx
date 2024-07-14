import { ThemeSelect } from './theme-select';

export function Footer() {
	return (
		<footer className='border-t w-full text-muted-foreground bg-background text-sm text-balance'>
			<div className='flex justify-between mx-auto container py-4'>
				<div className='flex flex-col xs:flex-row gap-4 xs:gap-8 sm:gap-12 lg:gap-16'>
					<p>
						Created by{' '}
						<a className='underline' href='https://jonahsnider.com'>
							Jonah Snider
						</a>
					</p>
					<div className='flex flex-col gap-3 min-w-min leading-none'>
						<p className='font-semibold'>Other projects</p>

						<a className='underline' href='https://frc.sh'>
							frc.sh
						</a>

						<a className='underline' href='https://scores.frc.sh'>
							scores.frc.sh
						</a>

						<a className='underline' href='https://frc-colors.com'>
							FRC Colors
						</a>
					</div>
				</div>

				<ThemeSelect />
			</div>
		</footer>
	);
}
