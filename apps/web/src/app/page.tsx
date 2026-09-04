import { captureException } from '@sentry/nextjs';
import { cookies } from 'next/headers';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { TeamCards } from '@/src/components/home/team-cards';
import { Navbar } from '@/src/components/navbar/navbar';
import { FooterWrapper } from '@/src/components/page-wrappers/footer-wrapper';
import { MainContent } from '@/src/components/page-wrappers/main-content';
import { trpcServer } from '@/src/trpc/trpc-server';
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

function HomePageFallback() {
	return (
		<FooterWrapper>
			<Navbar />

			<MainContent />
		</FooterWrapper>
	);
}

async function HomePageContent() {
	await connection();

	const userCookies = await cookies();

	try {
		// The user can't be signed in if they don't have a session cookie
		// This optimization improves TTFB for first-time visitors
		const isAuthed = userCookies.has('adonis-session') && (await trpcServer.user.isAuthedFast.query());

		if (isAuthed) {
			return <AuthedHomePage />;
		}
	} catch (error) {
		captureException(error);
	}

	return <LandingPage />;
}

export default function HomePage() {
	return (
		<Suspense fallback={<HomePageFallback />}>
			<HomePageContent />
		</Suspense>
	);
}
