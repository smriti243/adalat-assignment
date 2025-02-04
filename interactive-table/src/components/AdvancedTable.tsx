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

import { ArrowUpDown, ChevronDown, Download, Search, Settings2, Check, Moon, Sun } from 'lucide-react';

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

interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

const AdvancedTable: React.FC<AdvancedTableProps> = ({ columns, data }) => {
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({});
  const [visibleColumns, setVisibleColumns] = useState(new Set(columns.map(col => col.header)));
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    setDarkMode(storedTheme === "dark");
  }, []);

  
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);
  
  
  
  const setPageSize = (size: number) => {
    setPagination(prev => ({ ...prev, pageSize: size }));
  };

  const buttonRef = useRef<HTMLButtonElement>(null);

  const table = useReactTable<RowData>({
    
    data,
    columns: columns.filter(col => visibleColumns.has(col.header)),
    state: {
      globalFilter,
      pagination , 
    },
    
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        setPagination((prev) => updater(prev)); 
      } else {
        setPagination(updater); 
      }
    },
    
  });

  const exportToCsv = () => {
    const rows = [
      columns.map((col) => col.header), 
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
    const enabledStyle = "bg-[#09090b] text-white border-white border hover:bg-[#09090b]/80 dark:bg-white dark:text-[#09090b] dark:hover:bg-gray-500 dark:border-[#09090B]";
    const disabledStyle = "bg-[#9CA1AA] text-white border-white dark:text-[#09090B] dark:border-[#09090B] border cursor-not-allowed"; 

    return canClick ? `${baseStyle} ${enabledStyle}` : `${baseStyle} ${disabledStyle}`;
  };

  const handleColumnResize = useCallback(
    (columnId: string, event: React.MouseEvent) => {
      const startX = event.clientX;
      const startWidth = columnWidths[columnId] || 200; 

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const newWidth = Math.max(50, startWidth + moveEvent.clientX - startX);
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

 
  const modifiedColumns = [
    ...columns.filter(col => col.header !== 'Checkpoints'), 
  ];
  useEffect(() => {
    if (dropdownVisible && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 200; 
      const screenWidth = window.innerWidth;
      
      let leftPosition = rect.left + window.scrollX;
  
    
      if (leftPosition + dropdownWidth > screenWidth) {
        leftPosition = screenWidth - dropdownWidth - 20; 
      }
  
  
      if (leftPosition < 10) {
        leftPosition = 10;
      }
  
      setDropdownPosition({ 
        top: rect.bottom + window.scrollY, 
        left: leftPosition - 10 
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
<div className="p-4 bg-white dark:bg-[#09090B] min-h-screen text-gray-900 dark:text-white">
  <div className="flex items-center justify-between mb-6">
    <h1 className="text-2xl font-semibold dark:text-white">DataHub</h1>
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="flex items-center gap-2 p-2 border rounded-lg transition hover:bg-gray-200 dark:hover:bg-gray-800"
    >
      {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      {darkMode ? "Light Mode" : "Dark Mode"}
    </button>
  </div>
      <div className="flex items-center gap-2 mb-4">
        <Search className="h-5 w-5 text-gray-500 dark:bg-gray-800 dark:text-gray-300 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search..."
          value={globalFilter ?? ''} 
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="p-2 border rounded-md shadow-sm focus:ring focus:ring-blue-300 dark:bg-[#09090B] search-bar w-full"
        />

        <button
          onClick={exportToCsv}
          className="ml-auto px-4 py-2 bg-[#09090B] text-white rounded-md hover:bg-[#09090B]/80 dark:bg-white dark:text-[#09090B] dark:hover:bg-gray-500 flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </button>

        <button
          ref={buttonRef}
          onClick={() => setDropdownVisible(!dropdownVisible)}
          className="ml-2 px-4 py-2 bg-[#09090B] text-white rounded-md hover:bg-[#09090B]/80 dark:bg-white dark:text-[#09090b] dark:hover:bg-gray-500 flex items-center relative"
        >
          <Settings2 className="h-4 w-4 mr-2" />
          View
        </button>

      

{dropdownVisible && (
        <div
          className="absolute bg-white dark:bg-[#09090B] border rounded-md shadow-lg w-48 z-10"
          style={{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }}
        >
          <ul className="p-2">
            {columns.map((col) => (
              <li
                key={col.header as string}
                className="cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
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
        <table className="table-auto w-full ">
        <thead>
  {table.getHeaderGroups().map((headerGroup) => (
    <tr key={headerGroup.id}
    className="bg-gray-100 dark:bg-[#09090B]/70">
      {headerGroup.headers.map((header) => (
        <th
          key={header.id}
          className="text-left p-2 border-b border-r border-gray-200  dark:border-gray-700 dark:text-white relative" 
          style={{ width: columnWidths[header.id] || 200 }} 
        >
          <div
            className="resizable-column-handle absolute right-0 top-0 h-full cursor-ew-resize"
            onMouseDown={(e) => handleColumnResize(header.id, e)}
            style={{ width: '10px' }} 
          />
      
          <div 
  className="inline-flex items-center cursor-pointer" 
  onClick={header.column.getToggleSortingHandler()} 
>
  {typeof header.column.columnDef.header === 'string'
    ? header.column.columnDef.header
    : flexRender(header.column.columnDef.header, header.getContext())}
  
  <ArrowUpDown 
    className={`h-4 w-4 ml-1 text-gray-500 dark:text-gray-300 transition-transform ${
      header.column.getIsSorted() === 'asc' ? 'rotate-180 text-black' : 
      header.column.getIsSorted() === 'desc' ? 'text-black' : 'text-gray-500'
    }`} 
  />
</div>

        </th>
      ))}
    </tr>
  ))}
</thead>


<tbody>
  {table.getRowModel().rows.map((row) => (
    <tr 
      key={row.id} 
      className="transition duration-200 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-sm"
    >
      {row.getVisibleCells().map((cell) => (
        <td
          key={cell.id}
          className="p-2 border-b border-r border-gray-200 dark:border-gray-700 dark:text-white"
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
   {/* Pagination */}
<div className="mt-4 flex flex-col items-center">
  {/* Navigation Buttons (Previous & Next) */}
  <div className="w-full flex justify-between items-center">
    <button
      onClick={() => table.previousPage()}
      disabled={!table.getCanPreviousPage()}
      className={buttonStyles(table.getCanPreviousPage())}
    >
      Previous
    </button>

    {/* Page Indicator in the Center */}
    <div className="text-center">
      Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
    </div>

    <button
      onClick={() => table.nextPage()}
      disabled={!table.getCanNextPage()}
      className={buttonStyles(table.getCanNextPage())}
    >
      Next
    </button>
  </div>

  {/* Rows per Page Selector Below the Page Number */}
  <div className="mt-2 flex items-center gap-2">
    <label htmlFor="pageSize">Rows per page:</label>
    <select
      id="pageSize"
      value={pagination.pageSize} 
      onChange={(e) => setPageSize(Number(e.target.value))}
      className="border rounded p-1 dark:bg-[#09090B]"
    >
      {[5, 10, 20, 50].map((size) => (
        <option key={size} value={size}>
          {size} per page
        </option>
      ))}
    </select>
  </div>
</div>
</div>
);
};

export default AdvancedTable;
