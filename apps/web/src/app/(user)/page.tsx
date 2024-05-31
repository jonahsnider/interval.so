import { Link } from 'next-view-transitions';

export default function HomePage() {
	return (
		<div className='flex flex-col gap-2'>
			<h1 className='text-6xl text-center'>Elegant hours tracking</h1>
			home page
			<Link href='/team/team581' className='underline'>
				test dash page
			</Link>
			<Link href='/team' className='underline'>
				create team page
			</Link>
			<Link href='/team/team581/invite/asd' className='underline'>
				team invite page
			</Link>
		</div>
	);
}
