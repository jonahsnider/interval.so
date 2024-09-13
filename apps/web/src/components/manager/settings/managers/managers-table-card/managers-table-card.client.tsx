'use client';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectGroup, SelectItem, SelectSeparator, SelectTrigger } from '@/components/ui/select';
import { trpc } from '@/src/trpc/trpc-client';
import { EllipsisHorizontalIcon } from '@heroicons/react/16/solid';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import { TeamManagerSchema } from '@interval.so/api/app/team_manager/schemas/team_manager_schema';
import type { TeamManagerRole } from '@interval.so/api/database/schema';
import { capitalize } from '@jonahsnider/util';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export function ManagersTableRoleSelect({
	manager,
	allowedRoleModifications,
	team,
}: {
	manager: TeamManagerSchema;
	allowedRoleModifications: TeamManagerRole[];
	team: Pick<TeamSchema, 'slug'>;
}) {
	const [toastId, setToastId] = useState<string | number | undefined>();
	const router = useRouter();

	const updateRole = trpc.teams.managers.updateRole.useMutation({
		onMutate: () => {
			setToastId(toast.loading(`Updating ${manager.user.displayName}'s role...`));
		},
		onSuccess: () => {
			toast.success(`Updated ${manager.user.displayName}'s role`, { id: toastId });
			router.refresh();
		},
		onError: (error) => {
			toast.error(`An error occurred while updating ${manager.user.displayName}'s role`, {
				description: error.message,
				id: toastId,
			});
		},
	});

	const selectOptions = allowedRoleModifications.length > 0 ? allowedRoleModifications : [manager.role];
	const selectOptionsWithoutOwner = selectOptions.filter((role) => role !== 'owner');

	const onValueChange = (value: string) => {
		const change = TeamManagerSchema.pick({ role: true }).parse({ role: value });

		updateRole.mutate({
			team,
			user: manager.user,
			change,
		});
	};

	return (
		<Select disabled={allowedRoleModifications.length === 0} onValueChange={onValueChange} value={manager.role}>
			<SelectTrigger className='min-w-48 max-w-min shadow-none'>{capitalize(manager.role)}</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					{selectOptionsWithoutOwner.map((role) => (
						<SelectItemRole key={role} managerRole={role} />
					))}
					{/* Owner role is an option, so we display it specially since ownership transfer is destructive */}
					{selectOptions.length !== selectOptionsWithoutOwner.length && (
						<>
							<SelectSeparator />
							<SelectItemRole managerRole='owner' destructive={true} />
						</>
					)}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}

function SelectItemRole({ managerRole, destructive }: { managerRole: TeamManagerRole; destructive?: boolean }) {
	return (
		<SelectItem
			value={managerRole}
			role='checkbox'
			className={clsx({
				'text-destructive focus:text-destructive focus:bg-destructive/10': destructive,
			})}
		>
			{managerRole === 'owner' ? 'Transfer ownership' : capitalize(managerRole)}
		</SelectItem>
	);
}

export function ManagersTableRowActions({
	manager,
	team,
}: {
	manager: Pick<TeamManagerSchema, 'user'>;
	team: Pick<TeamSchema, 'slug'>;
}) {
	const [toastId, setToastId] = useState<string | number | undefined>();
	const router = useRouter();

	const removeManager = trpc.teams.managers.removeManager.useMutation({
		onMutate: () => {
			setToastId(toast.loading(`Removing ${manager.user.displayName}...`));
		},
		onSuccess: () => {
			toast.success(`Removed ${manager.user.displayName}`, { id: toastId });
			router.refresh();
		},
		onError: (error) => {
			toast.error(`An error occurred while removing ${manager.user.displayName}`, {
				description: error.message,
				id: toastId,
			});
		},
	});

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild={true}>
				<Button size='icon' variant='ghost'>
					<EllipsisHorizontalIcon className='h-4 w-4' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end'>
				<DropdownMenuItem
					className='text-destructive focus:text-destructive focus:bg-destructive/10'
					onClick={() =>
						removeManager.mutate({
							team,
							user: manager.user,
						})
					}
					disabled={removeManager.isPending}
				>
					Remove
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
