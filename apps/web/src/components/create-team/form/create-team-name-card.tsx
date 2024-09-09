import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { CreateTeamFormType } from '@/src/app/team/(create)/page';

type Props = {
	form: CreateTeamFormType;
};

export function CreateTeamNameCard({ form }: Props) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Team name</CardTitle>
				<CardDescription>Please enter a display name for the new team.</CardDescription>
			</CardHeader>
			<CardContent>
				<FormField
					control={form.control}
					name='displayName'
					render={({ field }) => (
						<FormItem {...field}>
							<Input {...field} className='max-w-80' type='text' placeholder='My Team' />

							<FormMessage />
						</FormItem>
					)}
				/>
			</CardContent>
		</Card>
	);
}
