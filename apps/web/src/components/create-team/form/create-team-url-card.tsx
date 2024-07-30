import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { CreateTeamFormType } from '@/src/app/team/(create)/page';

type Props = {
	form: CreateTeamFormType;
};

export function CreateTeamUrlCard({ form }: Props) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Team URL</CardTitle>
				<CardDescription>
					This is your team's URL on the Interval platform. Team members can use this URL to access your team's page.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<FormField
					control={form.control}
					name='slug'
					render={({ field }) => (
						<FormItem {...field}>
							<div className='flex'>
								<span className='flex h-9 items-center justify-center rounded-md border border-input-border bg-muted/40 px-3 py-1 text-sm shadow-sm transition-colors cursor-not-allowed rounded-r-none border-r-0 text-muted-foreground'>
									https://interval.so/team/
								</span>
								<Input {...field} className='max-w-80 rounded-l-none' placeholder='team581' />
							</div>

							<FormMessage />
						</FormItem>
					)}
				/>
			</CardContent>
		</Card>
	);
}
