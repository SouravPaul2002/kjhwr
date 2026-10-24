import React, { useState, useMemo } from 'react';
import {
  Table,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Search,
  FileSpreadsheet,
} from 'lucide-react';
import { formatUtcDateTime, formatMw, formatSignedError, formatNumber } from '../utils/formatters';

export default function HourlyRecordsTable({ records, isLoading }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState('delivery_time');
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'
  const [searchTerm, setSearchTerm] = useState('');

  // Calculate error for each record and filter by search term
  const processedRecords = useMemo(() => {
    if (!records || records.length === 0) return [];

    let list = records.map((r) => {
      const error = r.forecast_generation - r.actual_generation;
      return {
        ...r,
        error,
      };
    });

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (r) =>
          r.delivery_time.toLowerCase().includes(term) ||
          r.forecast_publish_time.toLowerCase().includes(term)
      );
    }

    // Sort
    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [records, searchTerm, sortField, sortDirection]);

  // Pagination calculation
  const totalRecords = processedRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedRecords = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return processedRecords.slice(start, start + pageSize);
  }, [processedRecords, safePage, pageSize]);

  // Handle header sorting click
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Export to CSV
  const exportToCsv = () => {
    if (!processedRecords.length) return;

    const headers = [
      'Delivery Time (UTC)',
      'Forecast Published At (UTC)',
      'Forecast Generation (MW)',
      'Actual Generation (MW)',
      'Forecast Error (MW)',
    ];

    const rows = processedRecords.map((r) => [
      r.delivery_time,
      r.forecast_publish_time,
      r.forecast_generation,
      r.actual_generation,
      r.error,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `uk_wind_forecast_actuals_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 ml-1 opacity-50" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-emerald-600 ml-1" />
    ) : (
      <ArrowDown className="w-3 h-3 text-emerald-600 ml-1" />
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs mb-6 overflow-hidden">
      {/* Table Header / Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Hourly Matched Records
            </h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              {formatNumber(records ? records.length : 0, 0)} Total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Hourly aligned generation and publication timestamps selected under the assumed cutoff.
          </p>
        </div>

        {/* Search & Export Actions */}
        <div className="flex items-center space-x-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter date..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 w-36 sm:w-44 bg-white"
            />
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={exportToCsv}
            disabled={!records || records.length === 0}
            className="inline-flex items-center px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Export filtered records to CSV"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold select-none">
            <tr>
              <th
                scope="col"
                onClick={() => handleSort('delivery_time')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center">
                  Delivery Time (UTC)
                  {getSortIcon('delivery_time')}
                </div>
              </th>
              <th
                scope="col"
                onClick={() => handleSort('forecast_publish_time')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center">
                  Forecast Published At (UTC)
                  {getSortIcon('forecast_publish_time')}
                </div>
              </th>
              <th
                scope="col"
                onClick={() => handleSort('forecast_generation')}
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center justify-end">
                  Forecast (MW)
                  {getSortIcon('forecast_generation')}
                </div>
              </th>
              <th
                scope="col"
                onClick={() => handleSort('actual_generation')}
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center justify-end">
                  Actual (MW)
                  {getSortIcon('actual_generation')}
                </div>
              </th>
              <th
                scope="col"
                onClick={() => handleSort('error')}
                className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center justify-end">
                  Forecast Error (MW)
                  {getSortIcon('error')}
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-3 px-4"><div className="h-4 bg-slate-100 rounded w-36" /></td>
                  <td className="py-3 px-4"><div className="h-4 bg-slate-100 rounded w-36" /></td>
                  <td className="py-3 px-4 text-right"><div className="h-4 bg-slate-100 rounded w-20 ml-auto" /></td>
                  <td className="py-3 px-4 text-right"><div className="h-4 bg-slate-100 rounded w-20 ml-auto" /></td>
                  <td className="py-3 px-4 text-right"><div className="h-4 bg-slate-100 rounded w-24 ml-auto" /></td>
                </tr>
              ))
            ) : paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-500">
                  No records match your search criteria or filter range.
                </td>
              </tr>
            ) : (
              paginatedRecords.map((record, index) => {
                const error = record.error;
                const isOver = error > 0;
                const isUnder = error < 0;

                return (
                  <tr
                    key={record.delivery_time + index}
                    className="hover:bg-slate-50/80 transition-colors font-mono"
                  >
                    <td className="py-2.5 px-4 font-sans text-slate-900 font-medium whitespace-nowrap">
                      {formatUtcDateTime(record.delivery_time)}
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-500 whitespace-nowrap text-[11px]">
                      {formatUtcDateTime(record.forecast_publish_time)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-blue-700 font-medium whitespace-nowrap">
                      {formatMw(record.forecast_generation)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-emerald-700 font-medium whitespace-nowrap">
                      {formatMw(record.actual_generation)}
                    </td>
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          isOver
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : isUnder
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {formatSignedError(error)}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!isLoading && totalRecords > 0 && (
        <div className="p-3.5 sm:px-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center space-x-3">
            <span>
              Showing{' '}
              <strong className="text-slate-900">
                {(safePage - 1) * pageSize + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-slate-900">
                {Math.min(safePage * pageSize, totalRecords)}
              </strong>{' '}
              of <strong className="text-slate-900">{totalRecords}</strong> records
            </span>

            {/* Page Size Selector */}
            <div className="flex items-center space-x-1 pl-3 border-l border-slate-200">
              <span className="text-slate-500 text-[11px]">Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="py-1 px-1.5 text-xs border border-slate-300 rounded bg-white text-slate-700 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={safePage === 1}
              className="p-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={safePage === 1}
              className="p-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 text-xs font-medium text-slate-700">
              Page {safePage} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={safePage >= totalPages}
              className="p-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={safePage >= totalPages}
              className="p-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
