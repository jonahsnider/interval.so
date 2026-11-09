import { QueryClient } from '@tanstack/react-query';
import { createTRPCClient, httpLink } from '@trpc/client';
import { createTRPCOptionsProxy, unstable_createHydrateClient } from '@trpc/tanstack-react-query';
import { ensureEntry, loadHandles } from '@trpc/tanstack-react-query/unstable-handles';
import { cookies } from 'next/headers';
import { cache } from 'react';
import 'server-only';
import superjson from 'superjson';
import { type AppRouterType, trpcUrl } from './common';

export const trpcServer = createTRPCClient<AppRouterType>({
	links: [
		// A shared server batch can use another request's cookies or an already-finished prerender context.
		httpLink({
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

const getQueryClient = cache(() => new QueryClient());
export const trpc = createTRPCOptionsProxy<AppRouterType>({ client: trpcServer, queryClient: getQueryClient });
export const HydrateClient = unstable_createHydrateClient(getQueryClient);

export async function loadMembersHandle(slug: string) {
	const [{ members }] = await loadHandles(trpc, {
		members: ensureEntry(trpc.teams.members.simpleMemberList, { slug }),
	});
	return members;
}

/** Request-scoped memoized queries shared by Server Components. */
export const getSelf = cache(() => trpcServer.user.getSelf.query());
export const getIsAuthed = cache(() => trpcServer.user.isAuthedFast.query());
export const getCurrentGuestTeam = cache(() => trpcServer.guestLogin.getCurrentGuestTeam.query());
export const getTeamNames = cache(() => trpcServer.teams.forUser.getTeamNames.query());
export const getTeamDisplayName = cache((slug: string) => trpcServer.teams.settings.getDisplayName.query({ slug }));
export const getSimpleMemberList = (slug: string) =>
	getQueryClient().ensureQueryData(trpc.teams.members.simpleMemberList.queryOptions({ slug }));
export const getTeamRole = cache((slug: string) => trpcServer.teams.forUser.getRole.query({ slug }));

export const getAuthState = cache(async () => {
	const [{ user }, guestTeam] = await Promise.all([getSelf(), getCurrentGuestTeam()]);

	return { user, guestTeam };
});
