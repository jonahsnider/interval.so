import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { CreateTeamFormType } from '@/src/app/team/(create)/page';

type Props = {
	form: CreateTeamFormType;
};

export function CreateTeamPasswordCard({ form }: Props) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Team password</CardTitle>
				<CardDescription>
					Visitors to your team URL must enter a password in order to gain access to the sign in form.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<FormField
					control={form.control}
					name='password'
					render={({ field }) => (
						<FormItem {...field}>
							<Input {...field} className='max-w-80' type='text' placeholder='secret123' />

							<FormMessage />
						</FormItem>
					)}
				/>
			</CardContent>
		</Card>
	);
}
