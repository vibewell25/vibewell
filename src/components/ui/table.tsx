import React from 'react';
import { cn } from '@/lib/utils';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  className?: string;
}

/**
 * Table - A component for displaying tabular data
 */
const Table = React.forwardRef<HTMLTableElement, TableProps>(({ className, ...props }, ref) => (
  <div className="w-full overflow-auto">
    <table ref={ref} className={cn('w-full caption-bottom text-sm', className)} {...props} />
  </div>
));
Table.displayName = 'Table';

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
}

/**
 * TableHeader - Table header section
 */
const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
  )
);
TableHeader.displayName = 'TableHeader';

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
}

/**
 * TableBody - Table body section
 */
const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
  )
);
TableBody.displayName = 'TableBody';

interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  className?: string;
}

/**
 * TableFooter - Table footer section
 */
const TableFooter = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn('bg-muted/50 font-medium', className)} {...props} />
  )
);
TableFooter.displayName = 'TableFooter';

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  className?: string;
}

/**
 * TableRow - Table row
 */
const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = 'TableRow';

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  className?: string;
}

/**
 * TableHead - Table header cell
 */
const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
        className
      )}
      {...props}
    />
  )
);
TableHead.displayName = 'TableHead';

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  className?: string;
}

/**
 * TableCell - Table cell
 */
const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)}
      {...props}
    />
  )
);
TableCell.displayName = 'TableCell';

interface TableCaptionProps extends React.HTMLAttributes<HTMLTableCaptionElement> {
  className?: string;
}

/**
 * TableCaption - Table caption
 */
const TableCaption = React.forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn('mt-4 text-sm text-muted-foreground', className)} {...props} />
  )
);
TableCaption.displayName = 'TableCaption';

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
