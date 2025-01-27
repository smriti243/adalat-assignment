import React, { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  Row,
} from '@tanstack/react-table';

import { ArrowUpDown, ChevronDown, Download, Search, Settings2 } from 'lucide-react';

interface RowData {
  name: string;
  age: number;
  country: string;
  city: string;
}

interface AdvancedTableProps {
  columns: ColumnDef<RowData>[];
  data: RowData[];
}

const AdvancedTable: React.FC<AdvancedTableProps> = ({ columns, data }) => {
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({});

  const table = useReactTable<RowData>({
    data,
    columns,
    state: {
      globalFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
  });

  const exportToCsv = () => {
    const rows = [
      columns.map((col) => col.header), // Add headers
      ...table.getRowModel().rows.map((row) =>
        row.getVisibleCells().map((cell) => cell.getValue())
      ),
    ];
    const csvContent = rows
      .map((row) => row.map((value) => `"${value}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'table-data.csv');
  };

  const buttonStyles = (canClick: boolean) => {
    const baseStyle = "px-4 py-2 text-white rounded-md";
    const enabledStyle = "bg-white text-[#09090B] border-[#09090B] border hover:bg-[#f0f0f0]";
    const disabledStyle = "bg-white text-[#848485] border-[#848485] border cursor-not-allowed";

    return canClick ? `${baseStyle} ${enabledStyle}` : `${baseStyle} ${disabledStyle}`;
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const newSelectedRows = new Set(table.getRowModel().rows.map((row) => row.id));
      setSelectedRows(newSelectedRows);
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleRowSelect = (rowId: string, checked: boolean) => {
    const newSelectedRows = new Set(selectedRows);
    if (checked) {
      newSelectedRows.add(rowId);
    } else {
      newSelectedRows.delete(rowId);
    }
    setSelectedRows(newSelectedRows);
  };

  const handleColumnResize = useCallback(
    (columnId: string, event: React.MouseEvent) => {
      const startX = event.clientX;
      const startWidth = columnWidths[columnId] || 200; // Default width if not set

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const newWidth = Math.max(20, startWidth + moveEvent.clientX - startX); // Minimum width of 50px
        setColumnWidths((prev) => ({
          ...prev,
          [columnId]: newWidth,
        }));
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [columnWidths]
  );

  return (
    <div className="p-4">
      <div className="heading">
        <h1>DataHub</h1>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search..."
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="p-2 border rounded-md shadow-sm focus:ring focus:ring-blue-300 search-bar w-full"
        />

        <button
          onClick={exportToCsv}
          className="ml-auto px-4 py-2 bg-[#09090B] text-white rounded-md hover:bg-[#09090B]/80 flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </button>

        {/* View Button with Settings Icon */}
        <button className="ml-2 px-4 py-2 bg-[#09090B] text-white rounded-md hover:bg-[#09090B]/80 flex items-center">
          <Settings2 className="h-4 w-4 mr-2" />
          View
        </button>
      </div>

      <table className="min-w-full border border-gray-300 rounded-lg shadow-md table-container">
        <thead className="bg-white">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              <th className="px-1 py-2 text-left text-sm font-semibold text-gray-700 border-r border-gray-300 w-[10px]">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedRows.size === table.getRowModel().rows.length}
                  className="w-4 h-4"
                />
              </th>
              {headerGroup.headers.map((header, index) => {
                const columnId = header.id;
                return (
                  <th
                    key={header.id}
                    className="relative px-4 py-2 text-left text-sm font-semibold text-gray-700 border-r border-gray-300 last:border-r-0"
                    style={{
                      width: columnWidths[columnId] || header.getSize(),
                    }}
                  >
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      <ArrowUpDown className="ml-2 h-4 w-4 text-gray-500" />
                    </div>
                    <div
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize"
                      onMouseDown={(e) => handleColumnResize(columnId, e)}
                    />
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200">
          {table.getRowModel().rows.map((row: Row<RowData>, rowIndex) => (
            <tr key={row.id}>
              <td className="px-1 py-2">
                <input
                  type="checkbox"
                  checked={selectedRows.has(row.id)}
                  onChange={(e) => handleRowSelect(row.id, e.target.checked)}
                  className="w-4 h-4"
                />
              </td>
              {row.getVisibleCells().map((cell, cellIndex) => (
                <td
                  key={cell.id}
                  className="px-4 py-2 text-sm text-gray-600 border-r border-gray-300 last:border-r-0"
                  style={{
                    width: columnWidths[cell.column.id] || cell.column.getSize(),
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4">
        <span className="text-sm">
          {selectedRows.size} of {table.getRowModel().rows.length} rows selected
        </span>
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className={`${buttonStyles(true)} ${!table.getCanPreviousPage() && 'opacity-50'}`}
        >
          Previous
        </button>
        <span className="text-sm">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className={`${buttonStyles(true)} ${!table.getCanNextPage() && 'opacity-50'}`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdvancedTable;
