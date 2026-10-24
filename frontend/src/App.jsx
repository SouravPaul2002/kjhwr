import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import AnalysisFilters from './components/AnalysisFilters';
import KpiCards from './components/KpiCard';
import ForecastActualChart from './components/ForecastActualChart';
import ForecastErrorChart from './components/ForecastErrorChart';
import HourlyRecordsTable from './components/HourlyRecordsTable';
import MethodologySection from './components/MethodologySection';
import { fetchAnalysis } from './services/analysisApi';
import { calculateExpectedPeriods } from './utils/formatters';
import { AlertCircle, RefreshCw, Layers } from 'lucide-react';

export default function App() {
  const [filters, setFilters] = useState({
    dateFrom: '2026-01-01',
    dateTo: '2026-01-31',
    cutoffHourUtc: 12,
  });

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Abort controller reference for ongoing requests
  const abortControllerRef = useRef(null);

  const loadData = useCallback(async (currentFilters) => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchAnalysis({
        dateFrom: currentFilters.dateFrom,
        dateTo: currentFilters.dateTo,
        cutoffHourUtc: currentFilters.cutoffHourUtc,
        signal: controller.signal,
      });

      setData(response);
      setLastUpdated(
        new Date().toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    } catch (err) {
      if (err.name === 'AbortError') {
        return; // Request was aborted by user action or new request, ignore
      }
      setError(err.message || 'An unexpected error occurred while fetching analysis.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData(filters);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadData]); // run on mount

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    loadData(newFilters);
  };

  const handleRefresh = () => {
    loadData(filters);
  };

  const expectedPeriods = calculateExpectedPeriods(filters.dateFrom, filters.dateTo);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* 1. Header with Identity and Controls */}
      <Header
        onRefresh={handleRefresh}
        isLoading={isLoading}
        isError={Boolean(error)}
        lastUpdated={lastUpdated}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Alert Banner */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-semibold text-rose-900">
                  Failed to Load Analysis
                </h3>
                <p className="text-xs text-rose-700 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-1.5 border border-rose-300 text-xs font-medium rounded-lg text-rose-800 bg-white hover:bg-rose-50 self-start sm:self-auto shrink-0 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
              Retry Connection
            </button>
          </div>
        )}

        {/* 2. Analysis Filter Controls */}
        <AnalysisFilters
          filters={filters}
          onApply={handleApplyFilters}
          isLoading={isLoading}
        />

        {/* Empty State Banner (No Error, but No Records) */}
        {!isLoading && !error && data && data.matched_records.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6 text-center">
            <Layers className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-amber-900">
              {data.message || 'No Matched Records Found'}
            </h3>
            <p className="text-xs text-amber-700 mt-1 max-w-md mx-auto">
              The backend found no forecasts or actuals matching the selected delivery date range and cutoff hour. Please adjust your parameters.
            </p>
          </div>
        )}

        {/* 3. Four KPI Summary Cards */}
        <KpiCards
          metrics={data?.metrics || null}
          expectedPeriods={expectedPeriods}
          isLoading={isLoading}
        />

        {/* 4. Main Chart: Forecast vs Actual Generation */}
        <ForecastActualChart
          records={data?.matched_records || []}
          isLoading={isLoading}
        />

        {/* 5. Secondary Chart: Forecast Error Over Time */}
        <ForecastErrorChart
          records={data?.matched_records || []}
          isLoading={isLoading}
        />

        {/* 6. Hourly Records Table */}
        <HourlyRecordsTable
          records={data?.matched_records || []}
          isLoading={isLoading}
        />

        {/* 7. Methodology & Assumptions Section */}
        <MethodologySection cutoffRule={data?.cutoff_rule} />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            WindSight — UK National Grid Wind Generation Forecast Analytics
          </div>
          <div className="flex items-center space-x-4 text-[11px] text-slate-400">
            <span>Data: Elexon BMRS (WINDFOR & FUELHH)</span>
            <span>•</span>
            <span>Period: January 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
