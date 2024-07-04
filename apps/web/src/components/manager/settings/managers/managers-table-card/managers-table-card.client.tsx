'use client';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger } from '@/components/ui/select';
import { trpc } from '@/src/trpc/trpc-client';
import { EllipsisHorizontalIcon } from '@heroicons/react/16/solid';
import type { TeamSchema } from '@hours.frc.sh/api/app/team/schemas/team_schema';
import { TeamManagerSchema } from '@hours.frc.sh/api/app/team_manager/schemas/team_manager_schema';
import type { TeamManagerRole } from '@hours.frc.sh/api/database/schema';
import { capitalize } from '@jonahsnider/util';
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
	const [optimisticRole, setOptimisticRole] = useState<TeamManagerRole>(manager.role);
	const router = useRouter();

	const updateRole = trpc.teams.managers.updateRole.useMutation({
		onMutate: ({ change }) => {
			setOptimisticRole(change.role);
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
			// Clear out optimistic state update that didn't succeed
			setOptimisticRole(manager.role);
		},
	});

	const selectOptions = allowedRoleModifications.length > 0 ? allowedRoleModifications : [manager.role];

	const onValueChange = (value: string) => {
		const change = TeamManagerSchema.pick({ role: true }).parse({ role: value });

		updateRole.mutate({
			team,
			user: manager.user,
			change,
		});
	};

	return (
		<Select
			defaultValue={manager.role}
			disabled={!allowedRoleModifications.length}
			onValueChange={onValueChange}
			value={optimisticRole}
		>
			<SelectTrigger className='min-w-48 max-w-min shadow-none'>{capitalize(optimisticRole)}</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					{selectOptions.map((role) => (
						<SelectItem key={role} value={role} role='checkbox'>
							{capitalize(role)}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
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
