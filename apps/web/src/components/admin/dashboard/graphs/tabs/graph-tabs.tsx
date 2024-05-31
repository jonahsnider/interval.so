'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import * as Tabs from '@radix-ui/react-tabs';
import { useQueryState } from 'nuqs';
import { AverageHoursGraph } from '../average-hours-graph';
import { UniqueMembersGraph } from '../unique-members-graph';
import { GraphTabTrigger } from './graph-tab-trigger';

export function GraphTabs() {
	const [selected, setSelected] = useQueryState('graph', { defaultValue: 'members', clearOnDefault: true });

	return (
		<Card>
			<Tabs.Root className='flex flex-col' defaultValue='members' onValueChange={setSelected} value={selected}>
				<CardHeader className='pt-0 px-0'>
					<Tabs.List className='bg-muted/50 border-b rounded-t-xl flex overflow-x-auto'>
						<GraphTabTrigger
							value='members'
							title='Members'
							measure={28}
							trend={0.2}
							selected={selected}
							className='rounded-tl-xl'
						/>
						<GraphTabTrigger value='hours' title='Average hours' measure={5.7} trend={-0.13} selected={selected} />
					</Tabs.List>
				</CardHeader>

				<CardContent>
					<Tabs.Content value='members'>
						<UniqueMembersGraph />
					</Tabs.Content>
					<Tabs.Content value='hours'>
						<AverageHoursGraph />
					</Tabs.Content>
				</CardContent>
			</Tabs.Root>
		</Card>
	);
}
