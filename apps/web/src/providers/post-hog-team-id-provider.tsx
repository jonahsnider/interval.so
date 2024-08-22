'use client';

import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import posthog from 'posthog-js';
import { type PropsWithChildren, createContext, useCallback, useMemo, useState } from 'react';

type ContextValue = {
	currentTeam: Pick<TeamSchema, 'id'> | undefined;
	setCurrentTeam: (team: Pick<TeamSchema, 'id'> | undefined) => void;
};

export const PostHogTeamIdContext = createContext<ContextValue>({
	currentTeam: undefined,
	setCurrentTeam: () => {},
});

export function PostHogTeamIdProvider({ children }: PropsWithChildren) {
	const [currentTeam, setCurrentTeamRaw] = useState<Pick<TeamSchema, 'id'> | undefined>();

	const setCurrentTeam = useCallback((team: Pick<TeamSchema, 'id'> | undefined) => {
		if (team) {
			posthog.group('company', team.id);
		} else {
			posthog.resetGroups();
		}

		setCurrentTeamRaw(team);
	}, []);

	const contextValue = useMemo(
		() => ({
			currentTeam,
			setCurrentTeam,
		}),
		[currentTeam, setCurrentTeam],
	);

	return <PostHogTeamIdContext.Provider value={contextValue}>{children}</PostHogTeamIdContext.Provider>;
}
