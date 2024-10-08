import { Link } from 'next-view-transitions';
import { ThemeSelect } from './theme-select';

export function Footer() {
	return (
		<footer className='border-t w-full text-muted-foreground bg-background text-sm xs:text-base'>
			<div className='flex justify-between mx-auto container py-4'>
				<div className='flex flex-col xs:flex-row gap-4 xs:gap-6 sm:gap-12 lg:gap-16'>
					<p>
						Created by{' '}
						<a className='underline' href='https://jonahsnider.com'>
							Jonah Snider
						</a>
					</p>

					<Link href='/home' className='underline'>
						Home
					</Link>

					<a className='underline' href='mailto:support@interval.so'>
						Contact
					</a>

					<a className='underline' href='https://github.com/jonahsnider/interval.so'>
						GitHub
					</a>
				</div>

				<ThemeSelect />
			</div>
		</footer>
	);
}
