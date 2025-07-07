'use client';

import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { createContext, type PropsWithChildren } from 'react';

type ContextValue = {
	team?: Pick<TeamSchema, 'slug'>;
};

export const TeamSlugContext = createContext<ContextValue>({});

type Props = PropsWithChildren<{
	team: Pick<TeamSchema, 'slug'>;
}>;

export function TeamSlugProvider({ children, team }: Props) {
	return <TeamSlugContext.Provider value={{ team }}>{children}</TeamSlugContext.Provider>;
}
