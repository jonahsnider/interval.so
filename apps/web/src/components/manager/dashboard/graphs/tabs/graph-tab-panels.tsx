'use client';

import { Tabs, TabsContent } from '@radix-ui/react-tabs';
import { parseAsStringEnum, useQueryState } from 'nuqs';
import { Activity, type PropsWithChildren, type ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { CardContent } from '@/components/ui/card';

const graphTabParser = parseAsStringEnum(['members', 'hours']).withDefault('members').withOptions({ history: 'push' });

type Props = PropsWithChildren<{
	members: ReactNode;
	hours: ReactNode;
}>;

export function GraphTabPanels({ children, members, hours }: Props) {
	const [tab, setTab] = useQueryState('tab', graphTabParser);

	return (
		<Tabs className='flex flex-col' value={tab} onValueChange={(value) => void setTab(graphTabParser.parse(value))}>
			{children}
			{Object.entries({ members, hours }).map(([value, graph]) => (
				<Activity key={value} mode={tab === value ? 'visible' : 'hidden'}>
					<TabsContent value={value} forceMount>
						<CardContent>
							<ErrorBoundary
								resetKeys={[graph]}
								fallback={
									<div className='flex items-center justify-center h-96'>
										<p className='text-muted-foreground'>An error occurred while rendering this graph</p>
									</div>
								}
							>
								{graph}
							</ErrorBoundary>
						</CardContent>
					</TabsContent>
				</Activity>
			))}
		</Tabs>
	);
}
