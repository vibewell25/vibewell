import React from 'react';
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

export interface Column {
  accessorKey?: string;
  header: string;
  id?: string;
  cell?: (props: { row: { original: any } }) => React.ReactNode;
interface DataTableProps {
  columns: Column[];
  data: any[];
  pagination?: boolean;
  sorting?: boolean;
  filtering?: boolean;
export function DataTable({
  columns,
  data,
  pagination = false,
  sorting = false,
  filtering = false,
: DataTableProps) {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [filterValue, setFilterValue] = React.useState('');

  // Apply filtering
  const filteredData = React.useMemo(() => {
    if (!filtering || !filterValue) return data;
    return data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(filterValue.toLowerCase()),
      ),
[data, filterValue, filtering]);

  // Apply sorting
  const sortedData = React.useMemo(() => {
    if (!sorting || !sortColumn) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
return aValue < bValue ? 1 : -1;
[filteredData, sortColumn, sortDirection, sorting]);

  // Apply pagination
  const paginatedData = React.useMemo(() => {
    if (!pagination) return sortedData;
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
[sortedData, page, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  return (
    <div>
      {filtering && (
        <div className="mb-4">
          <Input
            placeholder="Filter records..."
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
            className="max-w-sm"
          />
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.id || column.accessorKey}
                onClick={() => {
                  if (sorting && column.accessorKey) {
                    if (sortColumn === column.accessorKey) {
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
else {
                      setSortColumn(column.accessorKey);
                      setSortDirection('asc');
className={sorting && column.accessorKey ? 'cursor-pointer' : ''}
              >
                {column.header}
                {sorting && column.accessorKey === sortColumn && (
                  <span>{sortDirection === 'asc' ? ' ↑' : ' ↓'}</span>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column) => (
                <TableCell key={column.id || column.accessorKey}>
                  {column.cell
                    ? column.cell({ row: { original: row } })
                    : column.accessorKey
                      ? row[column.accessorKey]
                      : null}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {pagination && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded border p-1"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
            <span>items per page</span>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>
              Previous
            </Button>
            <span className="py-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
