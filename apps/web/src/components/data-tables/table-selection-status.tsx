import type { Table } from '@tanstack/react-table';
import clsx from 'clsx';

type Props<TData> = {
	table: Table<TData>;
};

export function TableSelectionStatus<TData>({ table }: Props<TData>) {
	return (
		<div
			className={clsx('flex-1 text-sm text-muted-foreground', {
				invisible: table.getFilteredSelectedRowModel().rows.length === 0,
			})}
		>
			{table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row
			{table.getFilteredRowModel().rows.length === 1 ? '' : 's'} selected.
		</div>
	);
}
