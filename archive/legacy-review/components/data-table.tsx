import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
from '@/components/ui/table';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
from '@tanstack/react-table';
import type { User, Subscription, Booking } from '@prisma/client';

interface DataTableProps {
  data: (User & {
    subscriptions: Subscription[];
    bookings: Booking[];
)[];
const columns: ColumnDef<User & { subscriptions: Subscription[]; bookings: Booking[] }>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
{
    accessorKey: 'email',
    header: 'Email',
{
    accessorKey: 'role',
    header: 'Role',
{
    accessorKey: 'subscriptions',
    header: 'Subscription Status',
    cell: ({ row }) => {
      const subscriptions = row.original.subscriptions;
      const activeSubscription = subscriptions.find((sub) => sub.status === 'active');
      return activeSubscription ? 'Active' : 'Inactive';
{
    accessorKey: 'bookings',
    header: 'Total Bookings',
    cell: ({ row }) => row.original.bookings.length,
{
    accessorKey: 'createdAt',
    header: 'Join Date',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
];

export function DataTable({ data }: DataTableProps) {
  const [sorting, setSorting] = useState([]);
  const [filtering, setFiltering] = useState('');

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter: filtering,
onSortingChange: setSorting,
    onGlobalFilterChange: setFiltering,
return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter users..."
          value={filtering}
          onChange={(e) => setFiltering(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
