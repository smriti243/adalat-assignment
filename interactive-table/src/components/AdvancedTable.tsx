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
  const [dropdownVisible, setDropdownVisible] = useState(false);

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

  const buttonStyles = (canClick: boolean) => {
    const baseStyle = "px-4 py-2 text-white rounded-md";
    const enabledStyle = "bg-white text-[#09090B] border-[#09090B] border hover:bg-[#f0f0f0]";
    const disabledStyle = "bg-white text-[#09090B] border-[#848485] border cursor-not-allowed opacity-80"; // Reduced opacity for disabled state

    return canClick ? `${baseStyle} ${enabledStyle}` : `${baseStyle} ${disabledStyle}`;
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

        <button
          onClick={() => setDropdownVisible(!dropdownVisible)}
          className="ml-2 px-4 py-2 bg-[#09090B] text-white rounded-md hover:bg-[#09090B]/80 flex items-center relative"
        >
          <Settings2 className="h-4 w-4 mr-2" />
          View
        </button>

        {/* Dropdown Menu */}
        {dropdownVisible && (
          <div className="absolute bg-white border rounded-md shadow-lg z-10 mt-2 w-48">
            <ul className="p-2">
              {columns.map((col, index) => (
                <li key={index} className="cursor-pointer p-2 hover:bg-gray-100">
                  {col.header as string} {/* Ensure the column header is a string */}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="table-auto w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-left p-2 border-b border-r border-gray-200" // Added border-right
                  >
                    {/* Ensure flexRender returns a valid ReactNode */}
                    {typeof header.column.columnDef.header === 'string'
                      ? header.column.columnDef.header
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="p-2 border-b border-r border-gray-200" // Added border-right
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        {/* Previous and Next Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className={buttonStyles(table.getCanPreviousPage())}
          >
            First
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={buttonStyles(table.getCanPreviousPage())}
          >
            Previous
          </button>
        </div>

        {/* Page Numbers in the Center */}
        <div className="flex-grow text-center">
          <span className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
        </div>

        {/* Next and Last Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={buttonStyles(table.getCanNextPage())}
          >
            Next
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className={buttonStyles(table.getCanNextPage())}
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedTable;
