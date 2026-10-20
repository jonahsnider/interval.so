'use client';

import { useResetTrpcClient } from '@/src/providers/trpc-provider';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { useTRPC } from '../trpc/trpc-client';

type Props = {
	redirectTo?: string;
};

export function useLogOut({ redirectTo }: Props = {}): {
	logOut: () => void;
	isPending: boolean;
} {
	const resetTrpcClient = useResetTrpcClient();
	const trpc = useTRPC();
	const [toastId, setToastId] = useState<string | number | undefined>();
	const router = useRouter();

	const logOut = useMutation(
		trpc.accounts.logOut.mutationOptions({
			onMutate: () => {
				setToastId(toast.loading('Logging out...'));
			},
			onSuccess: () => {
				resetTrpcClient();
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
		}),
	);

	return {
		logOut: () => {
			logOut.mutate();
		},
		isPending: logOut.isPending,
	};
}
