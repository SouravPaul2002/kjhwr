import React from 'react';
import { Target, TrendingUp, Compass, CheckCircle2, AlertTriangle } from 'lucide-react';
import { formatNumber } from '../utils/formatters';

export default function KpiCards({ metrics, expectedPeriods, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs animate-pulse">
            <div className="h-4 w-24 bg-slate-200 rounded mb-3" />
            <div className="h-7 w-32 bg-slate-200 rounded mb-2" />
            <div className="h-3 w-48 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const hasMetrics = metrics !== null && metrics !== undefined;
  const sampleCount = hasMetrics ? metrics.sample_count : 0;
  const coveragePercent =
    hasMetrics && expectedPeriods && expectedPeriods > 0
      ? Math.min(100, Math.round((sampleCount / expectedPeriods) * 100))
      : null;

  const biasValue = hasMetrics ? metrics.bias : null;
  const isOverforecast = biasValue !== null && biasValue > 0;
  const isUnderforecast = biasValue !== null && biasValue < 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. MAE */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              MAE
            </span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {hasMetrics ? formatNumber(metrics.mae, 2) : '—'}
            </span>
            <span className="ml-1.5 text-xs font-semibold text-slate-500">MW</span>
          </div>
          <p className="mt-1 text-xs text-slate-600 font-medium">Mean Absolute Error</p>
        </div>
        <p className="mt-3 text-[11px] text-slate-400 border-t border-slate-100 pt-2.5">
          Average absolute magnitude of differences between forecast and actual generation.
        </p>
      </div>

      {/* 2. RMSE */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              RMSE
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {hasMetrics ? formatNumber(metrics.rmse, 2) : '—'}
            </span>
            <span className="ml-1.5 text-xs font-semibold text-slate-500">MW</span>
          </div>
          <p className="mt-1 text-xs text-slate-600 font-medium">Root Mean Squared Error</p>
        </div>
        <p className="mt-3 text-[11px] text-slate-400 border-t border-slate-100 pt-2.5">
          Penalizes larger forecast discrepancies more heavily than smaller errors.
        </p>
      </div>

      {/* 3. Forecast Bias */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Forecast Bias
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Compass className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline">
            <span className={`text-2xl font-bold tracking-tight ${
              !hasMetrics ? 'text-slate-900' : isOverforecast ? 'text-blue-700' : isUnderforecast ? 'text-amber-700' : 'text-slate-900'
            }`}>
              {hasMetrics ? (biasValue > 0 ? `+${formatNumber(biasValue, 2)}` : formatNumber(biasValue, 2)) : '—'}
            </span>
            <span className="ml-1.5 text-xs font-semibold text-slate-500">MW</span>
          </div>
          <div className="mt-1 flex items-center space-x-1.5">
            {hasMetrics && (
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                isOverforecast
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : isUnderforecast
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {isOverforecast ? 'Overforecasting on Avg' : isUnderforecast ? 'Underforecasting on Avg' : 'Unbiased'}
              </span>
            )}
          </div>
        </div>
        <p className="mt-3 text-[11px] text-slate-400 border-t border-slate-100 pt-2.5">
          Calculated as <code className="text-slate-600 font-mono">forecast - actual</code>. Positive indicates overprediction.
        </p>
      </div>

      {/* 4. Matched Records & Coverage */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Matched Records
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {hasMetrics ? formatNumber(sampleCount, 0) : '0'}
            </span>
            {expectedPeriods && (
              <span className="ml-1 text-xs font-medium text-slate-400">
                / {formatNumber(expectedPeriods, 0)} hrs
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center space-x-2">
            {coveragePercent !== null && (
              <>
                <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      coveragePercent >= 99
                        ? 'bg-emerald-500'
                        : coveragePercent >= 90
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${coveragePercent}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-600 shrink-0">
                  {coveragePercent}%
                </span>
              </>
            )}
          </div>
        </div>
        <div className="mt-3 text-[11px] text-slate-400 border-t border-slate-100 pt-2.5 flex items-center justify-between">
          <span>Aligned hourly periods</span>
          {coveragePercent !== null && coveragePercent < 100 && (
            <span className="text-amber-600 font-medium inline-flex items-center">
              <AlertTriangle className="w-3 h-3 mr-0.5" />
              {expectedPeriods - sampleCount} missing
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
