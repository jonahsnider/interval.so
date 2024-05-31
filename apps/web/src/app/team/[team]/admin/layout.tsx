import { AdminNavbar } from '@/src/components/admin/navbar/admin-navbar';
import type { PropsWithChildren } from 'react';

// biome-ignore lint/style/noDefaultExport: This must be a default export
export default function AdminLayout({ children }: PropsWithChildren) {
	return (
		<>
			<AdminNavbar />
			{children}
		</>
	);
}
