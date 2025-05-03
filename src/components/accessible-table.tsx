import React, { useState, useRef } from 'react';

interface TableColumn {
  key: string;
  header: string;
  sortable?: boolean;
}

interface TableRow {
  [key: string]: React?.ReactNode;
}

interface AccessibleTableProps {
  columns: TableColumn[];
  data: TableRow[];
  className?: string;
  caption?: string;
  sortable?: boolean;
  onSort?: (columnKey: string, direction: 'asc' | 'desc') => void;
}

export const AccessibleTable: React?.FC<AccessibleTableProps> = ({
  columns,
  data,
  className = '',
  caption,
  sortable = false,
  onSort,
}) => {
  const [sortedColumn, setSortedColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const tableRef = useRef<HTMLTableElement>(null);

  const handleSort = (columnKey: string) => {
    if (!sortable) return;

    const newDirection = sortedColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortedColumn(columnKey);
    setSortDirection(newDirection);
    onSort?.(columnKey, newDirection);
  };

  const handleKeyDown = (e: React?.KeyboardEvent, rowIndex: number, columnIndex: number) => {
    if (!tableRef?.current) return;

    const rows = tableRef?.current.querySelectorAll('tbody tr');
    const cells = rows[rowIndex].querySelectorAll('td, th');
    const totalRows = rows?.length;
    const totalCells = cells?.length;

    switch (e?.key) {
      case 'ArrowUp':
        e?.preventDefault();
        if (rowIndex > 0) {
          const prevRow = rows[rowIndex - 1];
          const prevCell = prevRow?.querySelectorAll('td, th')[columnIndex];
          (prevCell as HTMLElement).focus();
        }
        break;
      case 'ArrowDown':
        e?.preventDefault();
        if (rowIndex < totalRows - 1) {
          const nextRow = rows[rowIndex + 1];
          const nextCell = nextRow?.querySelectorAll('td, th')[columnIndex];
          (nextCell as HTMLElement).focus();
        }
        break;
      case 'ArrowLeft':
        e?.preventDefault();
        if (columnIndex > 0) {
          (cells[columnIndex - 1] as HTMLElement).focus();
        }
        break;
      case 'ArrowRight':
        e?.preventDefault();
        if (columnIndex < totalCells - 1) {
          (cells[columnIndex + 1] as HTMLElement).focus();
        }
        break;
      case 'Home':
        e?.preventDefault();
        (cells[0] as HTMLElement).focus();
        break;
      case 'End':
        e?.preventDefault();
        (cells[totalCells - 1] as HTMLElement).focus();
        break;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table
        ref={tableRef}
        className={`min-w-full divide-y divide-gray-200 ${className}`}
        role="grid"
      >
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-gray-50">
          <tr>
            {columns?.map((column, columnIndex) => (
              <th
                key={column?.key}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 ${column?.sortable ? 'cursor-pointer' : ''} `}
                onClick={() => column?.sortable && handleSort(column?.key)}
                onKeyDown={(e) => handleKeyDown(e, 0, columnIndex)}
                tabIndex={0}
                aria-sort={
                  column?.sortable
                    ? sortedColumn === column?.key
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                    : undefined
                }
              >
                <div className="flex items-center">
                  {column?.header}
                  {column?.sortable && (
                    <span className="ml-2">
                      {sortedColumn === column?.key ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data?.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              {columns?.map((column, columnIndex) => (
                <td
                  key={column?.key}
                  className="whitespace-nowrap px-6 py-4 text-sm text-gray-900"
                  tabIndex={0}
                  onKeyDown={(e) => handleKeyDown(e, rowIndex, columnIndex)}
                >
                  {row[column?.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AccessibleTable;
