import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { formatUtcDateTime, formatChartAxisTick, formatMw, formatSignedError } from '../utils/formatters';
import { Zap, TrendingUp, Info } from 'lucide-react';

// Custom Tooltip component
function CustomForecastActualTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0]?.payload;
  if (!dataPoint) return null;

  const forecast = dataPoint.forecast_generation;
  const actual = dataPoint.actual_generation;
  const error = forecast - actual;
  const isOver = error > 0;

  return (
    <div className="bg-white/95 backdrop-blur-xs p-3.5 rounded-lg border border-slate-200 shadow-md text-xs min-w-[220px]">
      <div className="font-semibold text-slate-800 border-b border-slate-100 pb-1.5 mb-2">
        {formatUtcDateTime(label)}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 mr-2 shrink-0" />
            Actual Generation:
          </span>
          <span className="font-semibold text-slate-900">{formatMw(actual)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 mr-2 shrink-0" />
            Day-Ahead Forecast:
          </span>
          <span className="font-semibold text-slate-900">{formatMw(forecast)}</span>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-1.5 mt-1.5">
          <span className="text-slate-500 font-medium">Forecast Error:</span>
          <span className={`font-semibold px-1.5 py-0.5 rounded text-[11px] ${
            isOver
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : error < 0
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-slate-100 text-slate-700'
          }`}>
            {formatSignedError(error)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ForecastActualChart({ records, isLoading }) {
  // Compute summary stats
  const stats = useMemo(() => {
    if (!records || records.length === 0) return null;

    let maxActual = -Infinity;
    let maxForecast = -Infinity;
    let sumActual = 0;

    for (const r of records) {
      if (r.actual_generation > maxActual) maxActual = r.actual_generation;
      if (r.forecast_generation > maxForecast) maxForecast = r.forecast_generation;
      sumActual += r.actual_generation;
    }

    return {
      maxActual,
      maxForecast,
      avgActual: sumActual / records.length,
    };
  }, [records]);

  // Determine tick interval for X-Axis based on record count
  const xTickInterval = useMemo(() => {
    if (!records || records.length === 0) return 0;
    if (records.length <= 48) return 3; // 2 days -> every 4 hours
    if (records.length <= 168) return 11; // 1 week -> every 12 hours
    if (records.length <= 360) return 23; // 2 weeks -> every 24 hours
    return 47; // full month (744) -> every 48 hours (~2 days)
  }, [records]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs mb-6">
        <div className="h-6 w-56 bg-slate-200 rounded animate-pulse mb-4" />
        <div className="h-72 w-full bg-slate-100 rounded animate-pulse" />
      </div>
    );
  }

  if (!records || records.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs mb-6 text-center">
        <Info className="h-8 w-8 text-slate-400 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-slate-800">No Forecast vs Actual Data Available</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          No records matched the selected filters. Try broadening the date range or adjusting the cutoff hour.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs mb-6">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Forecast vs Actual Wind Generation
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Hourly UK national wind generation (MW) across the selected delivery period.
          </p>
        </div>

        {/* Quick Highlights */}
        {stats && (
          <div className="flex items-center space-x-3 text-xs">
            <div className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-200">
              <span className="text-[10px] text-emerald-600 uppercase font-semibold block leading-none mb-0.5">
                Peak Actual
              </span>
              <span className="font-bold">{formatMw(stats.maxActual, 0)}</span>
            </div>
            <div className="bg-blue-50 text-blue-800 px-2.5 py-1 rounded-md border border-blue-200">
              <span className="text-[10px] text-blue-600 uppercase font-semibold block leading-none mb-0.5">
                Peak Forecast
              </span>
              <span className="font-bold">{formatMw(stats.maxForecast, 0)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Chart Canvas - Horizontally Scrollable on Mobile */}
      <div className="overflow-x-auto pt-4 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="h-72 sm:h-80 min-w-[650px] sm:min-w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={records}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="delivery_time"
                tickFormatter={formatChartAxisTick}
                interval={xTickInterval}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={{ stroke: '#cbd5e1' }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                unit=" MW"
                width={65}
              />
              <Tooltip content={<CustomForecastActualTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 12, fontSize: 12 }}
                iconType="circle"
                iconSize={8}
              />
              <Line
                name="Actual Generation"
                type="monotone"
                dataKey="actual_generation"
                stroke="#059669"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }}
              />
              <Line
                name="Forecast Generation"
                type="monotone"
                dataKey="forecast_generation"
                stroke="#2563eb"
                strokeWidth={1.75}
                strokeDasharray="4 2"
                dot={false}
                activeDot={{ r: 5, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-400 gap-1">
        <span className="sm:hidden text-emerald-600 font-medium">
          ↔ Swipe horizontally to explore timeline
        </span>
        <span className="sm:ml-auto">
          * Source: Elexon BMRS FUELHH (Actuals) & WINDFOR (Forecasts). All timestamps in UTC.
        </span>
      </div>
    </div>
  );
}
