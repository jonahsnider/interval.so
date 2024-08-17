import { TeamCards } from '@/src/components/home/team-cards';
import { Navbar } from '@/src/components/navbar/navbar';
import { FooterWrapper } from '@/src/components/page-wrappers/footer-wrapper';
import { MainContent } from '@/src/components/page-wrappers/main-content';
import { trpcServer } from '@/src/trpc/trpc-server';
import { captureException } from '@sentry/nextjs';
import { unstable_noStore as noStore } from 'next/cache';
import LandingPage from './home/page';

function AuthedHomePage() {
	return (
		<FooterWrapper>
			<Navbar />

			<MainContent>
				<div className='flex items-center justify-center w-full'>
					<TeamCards />
				</div>
			</MainContent>
		</FooterWrapper>
	);
}

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default async function HomePage() {
	noStore();

	try {
		const { user } = await trpcServer.user.getSelf.query();

		if (user) {
			return <AuthedHomePage />;
		}
	} catch (error) {
		captureException(error);
	}

	return <LandingPage />;
}
