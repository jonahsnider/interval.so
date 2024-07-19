import { Button } from '@/components/ui/button';
import {
	Command,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/src/trpc/trpc-client';
import { CheckIcon, UsersIcon } from '@heroicons/react/16/solid';
import type { TeamSchema } from '@interval.so/api/app/team/schemas/team_schema';
import type { TeamMemberSchema } from '@interval.so/api/app/team_member/schemas/team_member_schema';
import clsx from 'clsx';
import { useState } from 'react';

type Props = {
	team: Pick<TeamSchema, 'slug'>;
	value: Pick<TeamMemberSchema, 'id' | 'name'>[];
	onChange: (value: Pick<TeamMemberSchema, 'id' | 'name'>[]) => void;
	className?: string;
};

export function AttendeesSelect({ onChange, value, team, className }: Props) {
	const [allMembers, setAllMembers] = useState<Pick<TeamMemberSchema, 'id' | 'name'>[]>([]);

	trpc.teams.members.simpleMemberListSubscription.useSubscription(team, {
		onData: setAllMembers,
	});

	return (
		<Popover>
			<PopoverTrigger asChild={true}>
				<Button variant='outline' className={clsx('flex items-center justify-center gap-2', className)}>
					<UsersIcon className='h-4 w-4' />
					Select attendees
					{value.length > 0 && (
						<>
							<Separator orientation='vertical' className='h-4' />
							<p>{value.length} selected</p>
						</>
					)}
				</Button>
			</PopoverTrigger>

			<PopoverContent className='p-0' align='start'>
				<Command>
					<CommandList>
						<CommandInput placeholder='Search attendees' />

						<CommandGroup>
							{allMembers.map((member) => {
								const isSelected = value.some((selected) => selected.id === member.id);

								return (
									<CommandItem
										key={member.id}
										onSelect={() => {
											onChange(isSelected ? value.filter((selected) => selected.id !== member.id) : [...value, member]);
										}}
									>
										<div
											className={clsx(
												'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
												isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible',
											)}
										>
											<CheckIcon className={clsx('h-4 w-4')} />
										</div>
										{member.name}
									</CommandItem>
								);
							})}
						</CommandGroup>

						{value.length > 0 && (
							<>
								<CommandSeparator />
								<CommandGroup>
									<CommandItem onSelect={() => onChange([])} className='justify-center text-center'>
										Clear selection
									</CommandItem>
								</CommandGroup>
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
