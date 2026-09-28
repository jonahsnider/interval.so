import { createTRPCClient, httpBatchStreamLink } from '@trpc/client';
import { cookies } from 'next/headers';
import { cache } from 'react';
import 'server-only';
import superjson from 'superjson';
import { type AppRouterType, trpcUrl } from './common';

export const trpcServer = createTRPCClient<AppRouterType>({
	links: [
		httpBatchStreamLink({
			transformer: superjson,
			url: trpcUrl,
			async headers() {
				try {
					const requestCookies = await cookies();

					return {
						cookie: requestCookies.toString(),
					};
				} catch (error) {
					// World's longest type narrowing expression
					if (
						error &&
						typeof error === 'object' &&
						'digest' in error &&
						typeof error.digest === 'string' &&
						error.digest === 'DYNAMIC_SERVER_USAGE'
					) {
						// This error occurs when Next is building the app for production (https://nextjs.org/docs/messages/dynamic-server-error)
						// Cookies aren't available, but part of static rendering means that this code path is getting executed
						// Since this is during a build, we can safely ignore this error and just not return any headers to add

						return {};
					}

					// This was some other error that occurred while getting the cookies, an error we actually care about
					throw error;
				}
			},
		}),
	],
});

/** Request-scoped memoized queries shared by Server Components. */
export const getSelf = cache(() => trpcServer.user.getSelf.query());
export const getIsAuthed = cache(() => trpcServer.user.isAuthedFast.query());
export const getCurrentGuestTeam = cache(() => trpcServer.guestLogin.getCurrentGuestTeam.query());
export const getTeamNames = cache(() => trpcServer.teams.forUser.getTeamNames.query());
export const getTeamDisplayName = cache((slug: string) => trpcServer.teams.settings.getDisplayName.query({ slug }));
export const getSimpleMemberList = cache((slug: string) => trpcServer.teams.members.simpleMemberList.query({ slug }));
export const getTeamRole = cache((slug: string) => trpcServer.teams.forUser.getRole.query({ slug }));

export const getAuthState = cache(async () => {
	const [{ user }, guestTeam] = await Promise.all([getSelf(), getCurrentGuestTeam()]);

	return { user, guestTeam };
});
