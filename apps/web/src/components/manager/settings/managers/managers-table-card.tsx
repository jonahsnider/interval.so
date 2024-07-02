import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EllipsisHorizontalIcon } from '@heroicons/react/16/solid';

type TeamManager = {
	name: string;
	role: 'owner' | 'admin';
};

const managers: TeamManager[] = [
	{
		name: 'Banana',
		role: 'owner',
	},
	{
		name: 'Apple',
		role: 'admin',
	},
	{
		name: 'Orange',
		role: 'admin',
	},
	{
		name: 'Pineapple',
		role: 'admin',
	},
];

export function ManagersTableCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Team managers</CardTitle>
				<CardDescription>Adjust access of other managers.</CardDescription>
			</CardHeader>

			<CardContent>
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
							{managers.map((admin) => (
								<TableRow key={admin.name}>
									<TableCell className='font-medium w-full'>{admin.name}</TableCell>
									<TableCell>
										<Select defaultValue={admin.role}>
											<SelectTrigger className='min-w-48 max-w-min shadow-none'>
												<SelectValue placeholder={admin.role === 'owner' ? 'Owner' : 'Admin'} />
											</SelectTrigger>
											<SelectContent>
												<SelectGroup>
													<SelectItem value='owner' role='checkbox'>
														Owner
													</SelectItem>
													<SelectItem value='admin' role='checkbox'>
														Admin
													</SelectItem>
												</SelectGroup>
											</SelectContent>
										</Select>
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild={true}>
												<Button size='icon' variant='ghost'>
													<EllipsisHorizontalIcon className='h-4 w-4' />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent>
												<DropdownMenuItem className='text-destructive focus:text-destructive focus:bg-destructive/10'>
													Remove
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}
