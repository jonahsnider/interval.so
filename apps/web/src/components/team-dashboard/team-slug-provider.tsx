'use client';

import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { type PropsWithChildren, createContext } from 'react';

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
