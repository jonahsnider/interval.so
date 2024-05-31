import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ClipboardIcon } from '@heroicons/react/20/solid';

export function AdminInviteLinkCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Admin invite link</CardTitle>
				<CardDescription>Allow other people to join your team as admins through the link below.</CardDescription>
			</CardHeader>
			<CardContent>
				<form>
					<div className='flex max-w-min shadow-sm rounded-md'>
						<span className='flex h-9 max-w-80  overflow-y-auto [scrollbar-width:none] items-center justify-start rounded-md border border-input px-3 py-1 text-sm transition-colors rounded-r-none border-r-0'>
							https://hours.frc.sh/teams/team581/invite/nxa0X74wNdOgKjEm04iPOco2DI4iN3SA
						</span>
						<Tooltip>
							<TooltipTrigger asChild={true}>
								<Button size='icon' variant='outline' className='rounded-l-none border-l-0 shadow-none' type='button'>
									<ClipboardIcon className='h-4 w-4' />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Copy invite link</p>
							</TooltipContent>
						</Tooltip>
					</div>
				</form>
			</CardContent>
			<CardFooter className='border-t px-6 py-4'>
				<Button variant='outline'>Reset invite link</Button>
			</CardFooter>
		</Card>
	);
}
