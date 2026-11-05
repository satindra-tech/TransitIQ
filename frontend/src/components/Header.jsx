import React from 'react';
import { 
  Bus, 
  Activity, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  RotateCcw,
  Sparkles,
  MapPin
} from 'lucide-react';

const DAYS = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' }
];

export default function Header({ 
  hour, 
  setHour, 
  dayOfWeek, 
  setDayOfWeek, 
  alertsCount = 0,
  onRefresh,
  loading
}) {
  const formatHour = (h) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:00 ${ampm}`;
  };

  const isPeak = (8 <= hour && hour <= 10) || (17 <= hour && hour <= 20);

  return (
    <header className="sticky top-0 z-40 bg-[#0c1427]/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Project Info */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#0b101d] rounded-[10px] flex items-center justify-center">
                <Bus className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Transit<span className="text-cyan-400">IQ</span>
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> AI Ops 2026
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3 h-3 text-red-400" />
              <span>Chennai MTC Operations Control Center</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 font-mono text-[11px]">CUMTA PS-4</span>
            </p>
          </div>
        </div>

        {/* Global Operational Controls: Hour Slider & Day Selector */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Day of week */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5 shadow-inner">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
              aria-label="Select Day of Week"
              className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
            >
              {DAYS.map((d) => (
                <option key={d.value} value={d.value} className="bg-slate-900 text-slate-200">
                  {d.label} {d.value >= 5 ? '(Weekend)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Hour Selector with Peak Indicator */}
          <div className="flex items-center gap-2.5 bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-1.5 shadow-inner">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="5"
                max="22"
                step="1"
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                aria-label="Hour of the day"
                className="w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-xs font-mono font-bold text-white min-w-[62px]">
                {formatHour(hour)}
              </span>
            </div>
            {isPeak && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded">
                PEAK RUSH
              </span>
            )}
          </div>

          {/* Live Alerts Counter */}
          <div className="flex items-center gap-1.5 bg-red-950/40 border border-red-800/60 text-red-300 rounded-lg px-2.5 py-1.5 text-xs font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-bounce" />
            <span>{alertsCount} Critical</span>
          </div>

          {/* Refresh Telemetry */}
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh Live Telemetry"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition shadow disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
