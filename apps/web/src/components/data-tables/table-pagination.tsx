import { ChevronLeftIcon, ChevronRightIcon, DoubleArrowLeftIcon, DoubleArrowRightIcon } from '@radix-ui/react-icons';
import type { Table } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Adapted from https://ui.shadcn.com/docs/components/data-table#reusable-components

// biome-ignore lint/style/useNamingConvention: This is in pascal case
interface TablePaginationProps<TData> {
	table: Table<TData>;
	pageSizes?: readonly number[];
}

const DEFAULT_PAGE_SIZES = [10, 25, 50] as const;

// biome-ignore lint/style/useNamingConvention: This is in pascal case
export function TablePagination<TData>({ table, pageSizes = DEFAULT_PAGE_SIZES }: TablePaginationProps<TData>) {
	return (
		<div className='flex items-center space-x-6 lg:space-x-8'>
			{pageSizes.length > 1 && (
				<div className='flex items-baseline space-x-2'>
					<p className='text-sm font-medium'>Rows per page</p>
					<Select
						value={`${table.getState().pagination.pageSize}`}
						onValueChange={(value) => {
							table.setPageSize(Number(value));
						}}
					>
						<SelectTrigger className='h-8 w-[70px] bg-background'>
							<SelectValue placeholder={table.getState().pagination.pageSize} />
						</SelectTrigger>
						<SelectContent side='top'>
							{pageSizes.map((pageSize) => (
								<SelectItem key={pageSize} value={`${pageSize}`}>
									{pageSize}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			)}
			<div className='flex w-[100px] items-center justify-center text-sm font-medium'>
				Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
			</div>
			<div className='flex items-center space-x-2'>
				<Button
					variant='outline'
					className='hidden h-8 w-8 p-0 lg:flex'
					onClick={() => table.setPageIndex(0)}
					disabled={!table.getCanPreviousPage()}
				>
					<span className='sr-only'>Go to first page</span>
					<DoubleArrowLeftIcon className='h-4 w-4' />
				</Button>
				<Button
					variant='outline'
					className='h-8 w-8 p-0'
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					<span className='sr-only'>Go to previous page</span>
					<ChevronLeftIcon className='h-4 w-4' />
				</Button>
				<Button
					variant='outline'
					className='h-8 w-8 p-0'
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					<span className='sr-only'>Go to next page</span>
					<ChevronRightIcon className='h-4 w-4' />
				</Button>
				<Button
					variant='outline'
					className='hidden h-8 w-8 p-0 lg:flex'
					onClick={() => table.setPageIndex(table.getPageCount() - 1)}
					disabled={!table.getCanNextPage()}
				>
					<span className='sr-only'>Go to last page</span>
					<DoubleArrowRightIcon className='h-4 w-4' />
				</Button>
			</div>
		</div>
	);
}
