import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const buttonRef = useRef<HTMLButtonElement>(null);

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

  // Modified columns without including "Checkpoints" in the dropdown menu
  const modifiedColumns = [
    {
      header: 'Checkpoints',
      accessorKey: 'checkpoints',
      cell: ({ row }: any) => (
        <input
          type="checkbox"
          checked={selectedRows.has(row.id)}
          onChange={(e) => handleRowSelect(row.id, e.target.checked)}
        />
      ),
      enableSorting: false, // Disabling sorting on the Checkpoints column
      enableFiltering: false, // Disable filtering
    },
    ...columns.filter(col => col.header !== 'Checkpoints'), // Exclude Checkpoints from the dropdown
  ];

  useEffect(() => {
    if (buttonRef.current && dropdownVisible) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
  
      let newLeft = buttonRect.left + window.scrollX;
      const dropdownWidth = 192; // Adjust width based on your dropdown content
  
      // Adjust the dropdown position if it extends beyond the screen width
      if (newLeft + dropdownWidth > screenWidth) {
        newLeft = screenWidth - dropdownWidth; // Position it to the right of the screen
      }
  
      setDropdownPosition({
        top: buttonRect.bottom + window.scrollY, // Position below the button
        left: newLeft, // Adjusted position based on screen width
      });
    }
  }, [dropdownVisible]);

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
          ref={buttonRef}
          onClick={() => setDropdownVisible(!dropdownVisible)}
          className="ml-2 px-4 py-2 bg-[#09090B] text-white rounded-md hover:bg-[#09090B]/80 flex items-center relative"
        >
          <Settings2 className="h-4 w-4 mr-2" />
          View
        </button>

        {/* Dropdown Menu */}
        {dropdownVisible && (
          <div
            className="absolute bg-white border rounded-md shadow-lg z-10 w-48 max-w-full" // max-w-full to prevent exceeding screen width
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
            }}
          >
            <ul className="p-2">
              {modifiedColumns.map((col, index) => (
                <li key={index} className="cursor-pointer p-2 hover:bg-gray-100">
                  {col.header as string}
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
        <button
          onClick={() => table.setPageIndex(table.getState().pagination.pageIndex - 1)}
          disabled={!table.getCanPreviousPage()}
          className="px-4 py-2 bg-[#09090B] text-white rounded-md hover:bg-[#09090B]/80 disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </span>
        <button
          onClick={() => table.setPageIndex(table.getState().pagination.pageIndex + 1)}
          disabled={!table.getCanNextPage()}
          className="px-4 py-2 bg-[#09090B] text-white rounded-md hover:bg-[#09090B]/80 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdvancedTable;
