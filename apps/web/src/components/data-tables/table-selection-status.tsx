import type { Table } from '@tanstack/react-table';

// biome-ignore lint/style/useNamingConvention: This is in pascal case
type Props<TData> = {
	table: Table<TData>;
};

// biome-ignore lint/style/useNamingConvention: This is in pascal case
export function TableSelectionStatus<TData>({ table }: Props<TData>) {
	return (
		<div className='flex-1 text-sm text-muted-foreground'>
			{table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
		</div>
	);
}
