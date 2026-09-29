'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '../trpc/trpc-client';

type Props = {
	redirectTo?: string;
};

export function useLogOut({ redirectTo }: Props = {}): {
	logOut: () => void;
	isPending: boolean;
} {
	const trpc = useTRPC();
	const [toastId, setToastId] = useState<string | number | undefined>();
	const router = useRouter();
	const queryClient = useQueryClient();

	const logOut = useMutation(
		trpc.accounts.logOut.mutationOptions({
			onMutate: () => {
				setToastId(toast.loading('Logging out...'));
			},
			onSuccess: () => {
				if (redirectTo) {
					router.push(redirectTo);
				}
				router.refresh();
				toast.success('You have been logged out', { id: toastId });

				// Invalidate tRPC context, used for analytics
				void queryClient.invalidateQueries(trpc.user.getSelf.queryFilter());
			},
			onError: (error) => {
				toast.error('An error occurred while logging you out', {
					description: error.message,
					id: toastId,
				});
			},
		}),
	);

	return {
		logOut: () => {
			logOut.mutate();
		},
		isPending: logOut.isPending,
	};
}
