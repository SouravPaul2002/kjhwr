import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { formatUtcDateTime, formatChartAxisTick, formatMw, formatSignedError } from '../utils/formatters';
import { Activity, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

function CustomErrorTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0]?.payload;
  if (!dataPoint) return null;

  const error = dataPoint.error;
  const isOver = error > 0;

  return (
    <div className="bg-white/95 backdrop-blur-xs p-3 rounded-lg border border-slate-200 shadow-md text-xs min-w-[200px]">
      <div className="font-semibold text-slate-800 border-b border-slate-100 pb-1.5 mb-1.5">
        {formatUtcDateTime(label)}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Forecast Generation:</span>
          <span className="font-medium text-slate-900">{formatMw(dataPoint.forecast_generation)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Actual Generation:</span>
          <span className="font-medium text-slate-900">{formatMw(dataPoint.actual_generation)}</span>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-1.5 mt-1.5">
          <span className="font-semibold text-slate-700">Forecast Error:</span>
          <span className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
            isOver
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : error < 0
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-slate-100 text-slate-700'
          }`}>
            {formatSignedError(error)}
          </span>
        </div>

        <div className="text-[10px] text-slate-400 mt-0.5">
          {isOver ? 'Overforecast (Surplus procurement)' : error < 0 ? 'Underforecast (Deficit procurement)' : 'Exact match'}
        </div>
      </div>
    </div>
  );
}

export default function ForecastErrorChart({ records, isLoading }) {
  // Transform records with error field and compute peak errors
  const { chartData, maxOverforecast, maxUnderforecast } = useMemo(() => {
    if (!records || records.length === 0) {
      return { chartData: [], maxOverforecast: null, maxUnderforecast: null };
    }

    let maxOver = 0;
    let maxUnder = 0;

    const data = records.map((r) => {
      const error = r.forecast_generation - r.actual_generation;
      if (error > maxOver) maxOver = error;
      if (error < maxUnder) maxUnder = error;

      return {
        ...r,
        error: Math.round(error * 10) / 10,
      };
    });

    return {
      chartData: data,
      maxOverforecast: maxOver > 0 ? maxOver : 0,
      maxUnderforecast: maxUnder < 0 ? maxUnder : 0,
    };
  }, [records]);

  // Determine tick interval for X-Axis based on record count
  const xTickInterval = useMemo(() => {
    if (!chartData || chartData.length === 0) return 0;
    if (chartData.length <= 48) return 3;
    if (chartData.length <= 168) return 11;
    if (chartData.length <= 360) return 23;
    return 47;
  }, [chartData]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs mb-6">
        <div className="h-6 w-48 bg-slate-200 rounded animate-pulse mb-4" />
        <div className="h-56 w-full bg-slate-100 rounded animate-pulse" />
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs mb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Forecast Error Over Time
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Signed difference (<code className="font-mono text-slate-600">forecast - actual</code>). Values above zero indicate overprediction.
          </p>
        </div>

        {/* Peak stats */}
        <div className="flex items-center space-x-2 text-xs">
          {maxOverforecast > 0 && (
            <div className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200 text-[11px]">
              <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
              <span>Max Over: <strong>+{Math.round(maxOverforecast).toLocaleString('en-GB')} MW</strong></span>
            </div>
          )}
          {maxUnderforecast < 0 && (
            <div className="flex items-center space-x-1 bg-amber-50 text-amber-700 px-2 py-1 rounded border border-amber-200 text-[11px]">
              <ArrowDownRight className="w-3.5 h-3.5 text-amber-600" />
              <span>Max Under: <strong>{Math.round(maxUnderforecast).toLocaleString('en-GB')} MW</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Chart - Horizontally Scrollable on Mobile */}
      <div className="overflow-x-auto pt-4 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="h-64 sm:h-72 min-w-[650px] sm:min-w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="errorColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
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
                tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
                unit=" MW"
                width={65}
              />
              <Tooltip content={<CustomErrorTooltip />} />
              <ReferenceLine
                y={0}
                stroke="#64748b"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: 'Zero Error Line (Exact Match)',
                  position: 'insideBottomRight',
                  fill: '#94a3b8',
                  fontSize: 10,
                }}
              />
              <Area
                type="monotone"
                dataKey="error"
                name="Forecast Error"
                stroke="#3b82f6"
                strokeWidth={1.75}
                fillOpacity={1}
                fill="url(#errorColor)"
                activeDot={{ r: 5, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 pt-2 border-t border-slate-50 text-[11px] text-slate-400 gap-1">
        <span className="sm:hidden text-indigo-600 font-medium">
          ↔ Swipe horizontally to explore timeline
        </span>
        <span className="flex items-center">
          <span className="inline-block w-2.5 h-0.5 bg-slate-500 mr-1.5" />
          Y = 0 represents perfect prediction
        </span>
        <span className="sm:ml-auto">
          Positive = Overforecasting | Negative = Underforecasting
        </span>
      </div>
    </div>
  );
}
