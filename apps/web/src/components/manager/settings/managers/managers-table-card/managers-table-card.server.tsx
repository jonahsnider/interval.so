import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import {
	type TeamManagerSchema,
	getAllowedRoleModifications,
} from '@hours.frc.sh/api/app/team_manager/schemas/team_manager_schema';
import 'server-only';
import { Skeleton } from '@/components/ui/skeleton';
import { trpcServer } from '@/src/trpc/trpc-server';
import { Suspense } from 'react';
import { ManagersTableRoleSelect, ManagersTableRowActions } from './managers-table-card.client';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
};

export function ManagersTableCard({ team }: Props) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Team managers</CardTitle>
				<CardDescription>Adjust access of other managers.</CardDescription>
			</CardHeader>

			<CardContent>
				<ManagersTable team={team} />
			</CardContent>
		</Card>
	);
}

function ManagersTable({ team }: Props) {
	return (
		<div className='rounded-lg border'>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Role</TableHead>
						<TableHead />
					</TableRow>
				</TableHeader>
				<TableBody>
					<Suspense fallback={<ManagersTableBodySkeleton />}>
						<ManagersTableBody team={team} />
					</Suspense>
				</TableBody>
			</Table>
		</div>
	);
}

function ManagersTableBodySkeleton() {
	return (
		<>
			<ManagersTableRowSkeleton />
			<ManagersTableRowSkeleton />
			<ManagersTableRowSkeleton />
			<ManagersTableRowSkeleton />
			<ManagersTableRowSkeleton />
		</>
	);
}

function ManagersTableRowSkeleton() {
	return (
		<TableRow>
			<TableCell className='w-full'>
				<Skeleton className='w-48 h-4' />
			</TableCell>
			<TableCell>
				<Skeleton className='h-9 w-48' />
			</TableCell>
			<TableCell>
				<Skeleton className='h-9 w-9' />
			</TableCell>
		</TableRow>
	);
}

async function ManagersTableBody({ team }: Props) {
	const [self, managers] = await Promise.all([
		trpcServer.teams.forUser.getRole.query(team),
		trpcServer.teams.managers.getList.query(team),
	]);

	return (
		<>
			{managers.map((manager) => (
				<ManagerTableRow key={manager.user.id} manager={manager} self={self} team={team} />
			))}
		</>
	);
}

function ManagerTableRow({
	manager,
	self,
	team,
}: {
	manager: TeamManagerSchema;
	self: Pick<TeamManagerSchema, 'role'>;
	team: Pick<TeamSchema, 'slug'>;
}) {
	const allowedRoleModifications = getAllowedRoleModifications(self, manager);

	return (
		<TableRow>
			<TableCell className='font-medium w-full'>{manager.user.displayName}</TableCell>
			<TableCell>
				<ManagersTableRoleSelect allowedRoleModifications={allowedRoleModifications} manager={manager} team={team} />
			</TableCell>
			<TableCell>
				{allowedRoleModifications.length > 0 && <ManagersTableRowActions manager={manager} team={team} />}
			</TableCell>
		</TableRow>
	);
}
