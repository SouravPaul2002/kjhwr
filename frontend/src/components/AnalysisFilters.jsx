import React, { useState } from 'react';
import { Filter, Calendar, Clock, RotateCcw, Info } from 'lucide-react';

export default function AnalysisFilters({
  filters,
  onApply,
  isLoading,
}) {
  const [dateFrom, setDateFrom] = useState(filters.dateFrom);
  const [dateTo, setDateTo] = useState(filters.dateTo);
  const [cutoffHour, setCutoffHour] = useState(filters.cutoffHourUtc);
  const [validationError, setValidationError] = useState('');


  const handleApply = (e) => {
    e.preventDefault();

    if (dateFrom > dateTo) {
      setValidationError('Start date must be earlier than or equal to End date.');
      return;
    }

    if (dateFrom < '2026-01-01' || dateTo > '2026-01-31') {
      setValidationError('Analysis is currently restricted to January 2026 (2026-01-01 to 2026-01-31).');
      return;
    }

    setValidationError('');
    onApply({
      dateFrom,
      dateTo,
      cutoffHourUtc: Number(cutoffHour),
    });
  };

  const handleReset = () => {
    setDateFrom('2026-01-01');
    setDateTo('2026-01-31');
    setCutoffHour(12);
    setValidationError('');
    onApply({
      dateFrom: '2026-01-01',
      dateTo: '2026-01-31',
      cutoffHourUtc: 12,
    });
  };


  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
              Analysis Configuration & Parameters
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure the delivery period and assumed procurement cutoff to filter forecast eligibility without look-ahead bias.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>Supported Scope: <strong className="text-slate-800">January 2026</strong></span>
        </div>
      </div>

      <form onSubmit={handleApply} className="pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Start Date */}
          <div>
            <label htmlFor="filter-start-date" className="block text-xs font-medium text-slate-700 mb-1.5">
              Start Date
            </label>
            <div className="relative rounded-lg shadow-2xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Calendar className="h-4 w-4" />
              </div>
              <input
                id="filter-start-date"
                type="date"
                min="2026-01-01"
                max="2026-01-31"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setValidationError('');
                }}
                disabled={isLoading}
                className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white"
                required
              />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="filter-end-date" className="block text-xs font-medium text-slate-700 mb-1.5">
              End Date
            </label>
            <div className="relative rounded-lg shadow-2xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Calendar className="h-4 w-4" />
              </div>
              <input
                id="filter-end-date"
                type="date"
                min="2026-01-01"
                max="2026-01-31"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setValidationError('');
                }}
                disabled={isLoading}
                className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white"
                required
              />
            </div>
          </div>

          {/* Assumed Cutoff Hour */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="filter-cutoff-hour" className="block text-xs font-medium text-slate-700">
                Cutoff Hour (UTC)
              </label>
              <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                Assumed Rule
              </span>
            </div>
            <div className="relative rounded-lg shadow-2xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Clock className="h-4 w-4" />
              </div>
              <select
                id="filter-cutoff-hour"
                value={cutoffHour}
                onChange={(e) => {
                  setCutoffHour(Number(e.target.value));
                  setValidationError('');
                }}
                disabled={isLoading}
                className="block w-full pl-9 pr-8 py-2 text-xs border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 bg-white"
              >
                {Array.from({ length: 24 }).map((_, i) => (
                  <option key={i} value={i}>
                    {String(i).padStart(2, '0')}:00 UTC (Day Before) {i === 12 ? '— Default (Noon)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 inline-flex justify-center items-center px-4 py-2 text-xs font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-xs transition-colors ${
                isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {isLoading ? 'Applying...' : 'Apply Filters'}
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              title="Reset to full month (2026-01-01 to 2026-01-31 at 12:00 UTC)"
              className="inline-flex items-center px-3 py-2 text-xs font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5 sm:mr-1 text-slate-600" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="mt-3 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
            {validationError}
          </div>
        )}

        {/* Informational Subtext */}
        <p className="mt-2 text-[11px] text-slate-400">
          * Note: For each delivery date, the backend selects the latest forecast published at or before{' '}
          <strong className="text-slate-600">{String(cutoffHour).padStart(2, '0')}:00 UTC</strong> on the preceding day.
        </p>
      </form>
    </div>
  );
}
