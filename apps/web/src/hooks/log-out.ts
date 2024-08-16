'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { trpc } from '../trpc/trpc-client';

type Props = {
	redirectTo?: string;
};

export function useLogOut({ redirectTo }: Props = {}): {
	logOut: () => void;
	isPending: boolean;
} {
	const [toastId, setToastId] = useState<string | number | undefined>();
	const router = useRouter();

	const logOut = trpc.accounts.logOut.useMutation({
		onMutate: () => {
			setToastId(toast.loading('Logging out...'));
		},
		onSuccess: () => {
			if (redirectTo) {
				router.push(redirectTo);
			}
			router.refresh();
			toast.success('You have been logged out', { id: toastId });
		},
		onError: (error) => {
			toast.error('An error occurred while logging you out', {
				description: error.message,
				id: toastId,
			});
		},
	});

	return {
		logOut: () => {
			logOut.mutate();
		},
		isPending: logOut.isPending,
	};
}
