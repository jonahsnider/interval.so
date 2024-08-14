import { unstable_flag as flag } from '@vercel/flags/next';

export const signupsEnabledFlag = flag({
	key: 'signups-enabled',
	decide: () => true,
});
