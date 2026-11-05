import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Clock, 
  Calendar, 
  User, 
  Bell, 
  RotateCcw,
  Shield,
  MapPin,
  Bus,
  Users,
  Radio
} from 'lucide-react';
import StatusBadge from './StatusBadge';

const DAYS = [
  { value: 0, label: 'Monday' },
  { value: 1, label: 'Tuesday' },
  { value: 2, label: 'Wednesday' },
  { value: 3, label: 'Thursday' },
  { value: 4, label: 'Friday' },
  { value: 5, label: 'Saturday' },
  { value: 6, label: 'Sunday' }
];

export default function TopHeader({
  hour,
  setHour,
  dayOfWeek,
  setDayOfWeek,
  activeRole,
  setActiveRole,
  isDarkMode,
  setIsDarkMode,
  alertsCount = 0,
  onRefresh,
  loading,
  onNavigateTab
}) {
  const [waitingCount, setWaitingCount] = useState(3);

  // Poll or fetch waiting passenger signals
  useEffect(() => {
    fetch('/api/passenger/live-signals')
      .then(r => r.json())
      .then(d => {
        if (d && typeof d.total_passengers_waiting === 'number') {
          setWaitingCount(d.total_passengers_waiting);
        }
      })
      .catch(() => {});
  }, [hour, dayOfWeek]);

  const formatHour = (h) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:00 ${ampm}`;
  };

  const isPeak = (8 <= hour && hour <= 10) || (17 <= hour && hour <= 20);

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3 transition-colors duration-200">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Welcome message & context */}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {activeRole === 'Passenger' ? 'Chennai MTC Passenger Live Portal' : 'Operations Control Center'}
            </h2>
            <StatusBadge status="ON TIME" size="sm" />
            {isPeak && <StatusBadge status="HIGH" size="sm" />}
            
            {/* Live Passenger Waiting Indicator for Operator */}
            {activeRole === 'Transport Operator' && waitingCount > 0 && (
              <button
                onClick={() => onNavigateTab?.('dashboard')}
                className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1.5 animate-pulse"
                title="Passengers currently waiting and signaling from bus stops"
              >
                <Radio className="w-3 h-3 text-rose-600 animate-spin" />
                <span>{waitingCount} Passengers Waiting at Stops</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-teal-600 dark:text-teal-400" />
            <span>Chennai Metropolitan Transport Corporation</span>
            <span>•</span>
            <span className="font-mono text-slate-600 dark:text-slate-300">Hour: {formatHour(hour)}</span>
          </p>
        </div>

        {/* Global Controls & 2-Login Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Day Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
              aria-label="Select Day"
              className="bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              {DAYS.map(d => (
                <option key={d.value} value={d.value} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  {d.label} {d.value >= 5 ? '(Weekend)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Time Slider */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs">
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <input
              type="range"
              min="5"
              max="22"
              step="1"
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
              aria-label="Select Hour"
              className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
            />
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200 min-w-[55px]">
              {formatHour(hour)}
            </span>
          </div>

          {/* Dedicated 2-Login Switcher (Transport Operator vs Passenger) */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs shadow-xs">
            <button
              onClick={() => {
                setActiveRole('Transport Operator');
                onNavigateTab?.('dashboard');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                activeRole === 'Transport Operator'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              <span>Operator Login</span>
            </button>
            <button
              onClick={() => {
                setActiveRole('Passenger');
                onNavigateTab?.('passenger');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                activeRole === 'Passenger'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Passenger Login</span>
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            title="Toggle Light / Dark Mode"
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
          </button>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh Live Data"
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-teal-600' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}