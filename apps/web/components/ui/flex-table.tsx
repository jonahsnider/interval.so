import * as React from 'react';
import { cn } from '@/lib/utils';

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
	({ className, ...props }, ref) => (
		<div className='relative w-full overflow-auto'>
			<div ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props} />
		</div>
	),
);
Table.displayName = 'Table';

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
	({ className, ...props }, ref) => <div ref={ref} className={cn(className)} {...props} />,
);
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
	({ className, ...props }, ref) => (
		<div ref={ref} className={cn('[&_div:last-child]:border-0', className)} {...props} />
	),
);
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
	({ className, ...props }, ref) => (
		<tfoot ref={ref} className={cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', className)} {...props} />
	),
);
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
	({ className, ...props }, ref) => (
		<div
			ref={ref}
			className={cn(
				'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
				className,
				'flex justify-between',
			)}
			{...props}
		/>
	),
);
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
	({ className, ...props }, ref) => (
		<div
			ref={ref}
			className={cn(
				'h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
				'flex items-center justify-center',
				className,
			)}
			{...props}
		/>
	),
);
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
	({ className, ...props }, ref) => (
		<div
			ref={ref}
			className={cn(
				'p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]',
				className,
				// Not sure why but adding "flex" makes this remove some kind of spacing between the cells, which makes the cell contents centered
				'flex',
			)}
			{...props}
		/>
	),
);
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
	({ className, ...props }, ref) => (
		<caption ref={ref} className={cn('mt-4 text-sm text-muted-foreground', className)} {...props} />
	),
);
TableCaption.displayName = 'TableCaption';

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
