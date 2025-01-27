import React from 'react';
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

import { ArrowUpDown, ChevronDown, Download, Search, Settings2 } from "lucide-react";

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
  const table = useReactTable({
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
    columnResizeMode: 'onChange', // Enable column resizing
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

  return (
    <div className="p-4">
      <div className="heading">
        <h1>DataHub</h1>
      </div>
      {/* Global Filter */}
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search..."
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="p-2 border rounded-md shadow-sm focus:ring focus:ring-blue-300 search-bar w-full"
        />
        {/* Export Button moved here */}
        <button
          onClick={exportToCsv}
          className="ml-auto px-4 py-2 bg-[#09090B] text-white rounded-md hover:bg-[#09090B]/80 flex items-center"
        >
          <Download className="h-4 w-4 mr-2" /> {/* Download Icon */}
          Export
        </button>
      </div>

      <table className="min-w-full border border-gray-300 rounded-lg shadow-md table-container">
        <thead className="bg-white">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => (
                <th
                  key={header.id}
                  className={`relative px-4 py-2 text-left text-sm font-semibold text-gray-700 border-r border-gray-300 last:border-r-0 ${
                    index === 0 ? 'rounded-tl-lg' : '' // Top-left corner
                  } ${
                    index === headerGroup.headers.length - 1
                      ? 'rounded-tr-lg'
                      : '' // Top-right corner
                  }`}
                  style={{
                    width: header.getSize(),
                  }}
                >
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    <ArrowUpDown className="ml-2 h-4 w-4 text-gray-500" /> {/* Always visible sort icon */}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200">
          {table.getRowModel().rows.map((row, rowIndex) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell, cellIndex) => (
                <td
                  key={cell.id}
                  className={`px-4 py-2 text-sm text-gray-600 border-r border-gray-300 last:border-r-0 ${
                    rowIndex === 0 && cellIndex === 0 ? 'rounded-tl-lg' : '' // Top-left corner
                  } ${
                    rowIndex === 0 &&
                    cellIndex === row.getVisibleCells().length - 1
                      ? 'rounded-tr-lg'
                      : '' // Top-right corner
                  } ${
                    rowIndex === table.getRowModel().rows.length - 1 &&
                    cellIndex === 0
                      ? 'rounded-bl-lg'
                      : '' // Bottom-left corner
                  } ${
                    rowIndex === table.getRowModel().rows.length - 1 &&
                    cellIndex === row.getVisibleCells().length - 1
                      ? 'rounded-br-lg'
                      : '' // Bottom-right corner
                  }`}
                  style={{
                    width: cell.column.getSize(),
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className={buttonStyles(table.getCanPreviousPage())}
        >
          Previous
        </button>
        <span className="text-sm">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className={buttonStyles(table.getCanNextPage())}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdvancedTable;
