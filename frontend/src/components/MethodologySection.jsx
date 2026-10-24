import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Database, Clock, Scale, AlertCircle } from 'lucide-react';

export default function MethodologySection({ cutoffRule }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs mb-8 overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center space-x-2.5">
          <BookOpen className="h-4 w-4 text-emerald-600 shrink-0" />
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Methodology, Data Processing & Analytical Assumptions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              How data is fetched from Elexon BMRS, aggregated, aligned, and measured.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            {isOpen ? 'Collapse' : 'Expand Details'}
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-5 sm:px-6 pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* 1. Data Sources */}
            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200">
              <div className="flex items-center space-x-2 mb-2 font-semibold text-slate-900">
                <Database className="h-3.5 w-3.5 text-emerald-600" />
                <h3>Primary Data Sources</h3>
              </div>
              <ul className="list-disc list-inside space-y-1.5 text-slate-600 leading-relaxed">
                <li>
                  <strong>Actual Generation:</strong> Sourced from Elexon's BMRS <code className="text-slate-800 font-mono">FUELHH</code> stream (Half-Hourly Generation by Fuel Type), filtered specifically for <code className="text-slate-800 font-mono">fuelType=WIND</code>.
                </li>
                <li>
                  <strong>Wind Forecasts:</strong> Sourced from Elexon's BMRS <code className="text-slate-800 font-mono">WINDFOR</code> stream (National Wind Generation Forecasts).
                </li>
              </ul>
            </div>

            {/* 2. Hourly Aggregation */}
            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200">
              <div className="flex items-center space-x-2 mb-2 font-semibold text-slate-900">
                <Scale className="h-3.5 w-3.5 text-blue-600" />
                <h3>Resolution & Hourly Aggregation</h3>
              </div>
              <ul className="list-disc list-inside space-y-1.5 text-slate-600 leading-relaxed">
                <li>
                  Forecasts in <code className="text-slate-800 font-mono">WINDFOR</code> are published at hourly resolution, while actuals in <code className="text-slate-800 font-mono">FUELHH</code> are recorded half-hourly (48 settlement periods/day).
                </li>
                <li>
                  Each delivery hour's actual generation is the arithmetic mean of its two constituent 30-minute settlement periods (:00 and :30).
                </li>
                <li>
                  <strong>Strict Quality Rule:</strong> Incomplete hours without both records are excluded from analysis to prevent skewed metrics.
                </li>
              </ul>
            </div>

            {/* 3. Look-Ahead Bias Prevention */}
            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200">
              <div className="flex items-center space-x-2 mb-2 font-semibold text-slate-900">
                <Clock className="h-3.5 w-3.5 text-indigo-600" />
                <h3>Procurement Cutoff & Alignment</h3>
              </div>
              <ul className="list-disc list-inside space-y-1.5 text-slate-600 leading-relaxed">
                <li>
                  To simulate realistic utility trading and prevent <em>look-ahead bias</em>, forecasts published after the decision cutoff are rejected.
                </li>
                <li>
                  For each delivery date, the backend selects the latest eligible forecast published at or before the cutoff on the previous day.
                </li>
                <li>
                  Active Rule: <span className="font-semibold text-slate-800">{cutoffRule || 'Previous day cutoff'}</span>.
                </li>
              </ul>
            </div>

            {/* 4. Error Metrics & Interpretation */}
            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200">
              <div className="flex items-center space-x-2 mb-2 font-semibold text-slate-900">
                <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                <h3>Metric Conventions & Assumptions</h3>
              </div>
              <ul className="list-disc list-inside space-y-1.5 text-slate-600 leading-relaxed">
                <li>
                  <strong>Forecast Error:</strong> Defined strictly as <code className="text-slate-800 font-mono">forecast_generation - actual_generation</code>.
                </li>
                <li>
                  <strong>Positive Bias:</strong> Suggests systematic overprediction, which in physical power markets can lead to buying surplus power.
                </li>
                <li>
                  <strong>Commercial Disclaimer:</strong> Accuracy metrics (MAE/RMSE) measure physical generation divergence and do not directly translate to financial cost or savings without settlement price data.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
