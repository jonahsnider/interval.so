'use client';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/16/solid';

type Props = {
	setDialogOpen: (open: boolean) => void;
};

export function EndMeetingItem({ setDialogOpen }: Props) {
	return (
		<DropdownMenuItem onClick={() => setDialogOpen(true)}>
			<ArrowRightStartOnRectangleIcon className='h-4 w-4 mr-2' />
			End meeting
		</DropdownMenuItem>
	);
}
