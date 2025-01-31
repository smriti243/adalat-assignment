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

import { ArrowUpDown, ChevronDown, Download, Search, Settings2, Check } from 'lucide-react';

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
  const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(col => col.header)));
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const buttonRef = useRef<HTMLButtonElement>(null);

  const table = useReactTable<RowData>({
    data,
    columns: columns.filter(col => visibleColumns.has(col.header)),
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
    const enabledStyle = "bg-[#09090b] text-white border-white border hover:bg-[#09090b]/80";
    const disabledStyle = "bg-[#09090b] text-white border-white border cursor-not-allowed "; // Reduced opacity for disabled state

    return canClick ? `${baseStyle} ${enabledStyle}` : `${baseStyle} ${disabledStyle}`;
  };

  const handleColumnResize = useCallback(
    (columnId: string, event: React.MouseEvent) => {
      const startX = event.clientX;
      const startWidth = columnWidths[columnId] || 200; // Default width if not set

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const newWidth = Math.max(50, startWidth + moveEvent.clientX - startX); // Minimum width of 50px
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

  const toggleColumnVisibility = (header: string) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(header)) newSet.delete(header);
      else newSet.add(header);
      return newSet;
    });
  };

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
          value={globalFilter ?? ''} // Fallback to empty string if undefined
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
        {/* {dropdownVisible && (
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
        )} */}

{dropdownVisible && (
        <div
          className="absolute bg-white border rounded-md shadow-lg w-48 z-10"
          style={{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }}
        >
          <ul className="p-2">
            {columns.map((col) => (
              <li
                key={col.header as string}
                className="cursor-pointer p-2 hover:bg-gray-100 flex items-center"
                onClick={() => toggleColumnVisibility(col.header as string)}
              >
                {visibleColumns.has(col.header) && <Check className="h-4 w-4 mr-2 text-green-600" />}
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
          className="text-left p-2 border-b border-r border-gray-200 relative" // Removed flex from here
          style={{ width: columnWidths[header.id] || 200 }} // Dynamically set the width
        >
          <div
            className="resizable-column-handle absolute right-0 top-0 h-full cursor-ew-resize"
            onMouseDown={(e) => handleColumnResize(header.id, e)}
            style={{ width: '10px' }} // Handle width
          />
          {/* Column Header with Arrow Icon */}
          <div className="inline-flex items-center"> {/* Change to inline-flex to prevent vertical stacking */}
            {typeof header.column.columnDef.header === 'string'
              ? header.column.columnDef.header
              : flexRender(header.column.columnDef.header, header.getContext())}
            <ArrowUpDown className="h-4 w-4 text-gray-500 ml-1" /> {/* Arrow icon with margin */}
          </div>
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
                    className="p-2 border-b border-r border-gray-200"
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
      <div className="mt-4 flex justify-between items-center">
        <div>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={buttonStyles(table.getCanPreviousPage())}
          >
            Previous
          </button>
          <span className="mx-2">
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
    </div>
  );
};

export default AdvancedTable;
