import { ThemeSelect } from './theme-select';

export function Footer() {
	return (
		<footer className='border-t w-full text-muted-foreground bg-background text-sm text-balance'>
			<div className='flex gap-16 mx-auto container py-4'>
				<p>
					Created by{' '}
					<a className='underline' href='https://jonahsnider.com'>
						Jonah Snider
					</a>
				</p>

				<div className='flex flex-col gap-1 min-w-min'>
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

				<div className='flex-1 flex items-center justify-end'>
					<ThemeSelect />
				</div>
			</div>
		</footer>
	);
}
