'use client';

import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

type Props = {
	setDialogOpen: (open: boolean) => void;
};

export function EndMeetingItem({ setDialogOpen }: Props) {
	return <DropdownMenuItem onClick={() => setDialogOpen(true)}>End meeting</DropdownMenuItem>;
}
