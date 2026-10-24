import React from 'react';
import { Wind, RefreshCw, ShieldAlert } from 'lucide-react';

export default function Header({ onRefresh, isLoading, isError, lastUpdated }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Brand Identity */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <Wind className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                WindSight
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                UK National Grid
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-normal">
              Wind Generation Forecast & Accuracy Analytics (Elexon BMRS)
            </p>
          </div>
        </div>

        {/* Status and Refresh Control */}
        <div className="flex items-center space-x-3 self-end sm:self-auto">
          {lastUpdated && (
            <span className="hidden md:inline-flex items-center text-xs text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              Updated: {lastUpdated}
            </span>
          )}

          {isError && (
            <span className="inline-flex items-center text-xs text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
              <ShieldAlert className="w-3.5 h-3.5 mr-1" />
              Connection Issue
            </span>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className={`inline-flex items-center px-3 py-1.5 border border-slate-300 text-xs font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500 transition-colors shadow-2xs ${
              isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            }`}
            title="Refetch live data from the backend"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 mr-1.5 text-slate-600 ${
                isLoading ? 'animate-spin text-emerald-600' : ''
              }`}
            />
            {isLoading ? 'Fetching Data...' : 'Refresh'}
          </button>
        </div>
      </div>
    </header>
  );
}
