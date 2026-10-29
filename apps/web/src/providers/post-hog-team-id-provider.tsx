'use client';

import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { usePostHog } from '@posthog/next';
import { createContext, type PropsWithChildren, useCallback, useMemo, useState } from 'react';

type ContextValue = {
	currentTeam: Pick<TeamSchema, 'id'> | undefined;
	setCurrentTeam: (team: Pick<TeamSchema, 'id'> | undefined) => void;
};

export const PostHogTeamIdContext = createContext<ContextValue>({
	currentTeam: undefined,
	setCurrentTeam: () => {},
});

export function PostHogTeamIdProvider({ children }: PropsWithChildren) {
	const posthog = usePostHog();
	const [currentTeam, setCurrentTeamRaw] = useState<Pick<TeamSchema, 'id'> | undefined>();

	const setCurrentTeam = useCallback(
		(team: Pick<TeamSchema, 'id'> | undefined) => {
			if (team) {
				posthog.group('company', team.id);
			} else {
				posthog.resetGroups();
			}

			setCurrentTeamRaw(team);
		},
		[posthog],
	);

	const contextValue = useMemo(
		() => ({
			currentTeam,
			setCurrentTeam,
		}),
		[currentTeam, setCurrentTeam],
	);

	return <PostHogTeamIdContext.Provider value={contextValue}>{children}</PostHogTeamIdContext.Provider>;
}
