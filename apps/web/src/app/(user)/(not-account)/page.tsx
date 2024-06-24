import { trpcServer } from '@/src/trpc/trpc-server';
import { Link } from 'next-view-transitions';
import { unstable_noStore as noStore } from 'next/cache';
import { redirect } from 'next/navigation';
// TODO: See if there's a better way to do routing
// Ideally the landing page for new users is statically rendered

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default async function HomePage() {
	noStore();
	const guestTeam = await trpcServer.guestLogin.getCurrentGuestTeam.query();

	if (guestTeam) {
		// You are signed in as a guest for a team, so instead of showing the landing page, we send you to your team's dashboard
		redirect(`/team/${guestTeam.slug}`);
	}

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
