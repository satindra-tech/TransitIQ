import React from 'react';
import { 
  LayoutDashboard, 
  BrainCircuit, 
  Activity, 
  Bell, 
  Sparkles, 
  Bus, 
  Sliders, 
  BarChart3, 
  Database, 
  Settings, 
  Users, 
  MapPin,
  PlayCircle,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'forecast', label: 'Demand Forecast', icon: BrainCircuit, badge: 'AI' },
  { id: 'live-ops', label: 'Live Operations', icon: Activity },
  { id: 'alerts', label: 'Alerts', icon: Bell, badgeColor: 'bg-rose-500' },
  { id: 'recommendations', label: 'Recommendations', icon: Sparkles },
  { id: 'bus-allocation', label: 'Bus Allocation', icon: Bus, badge: 'Smart' },
  { id: 'simulator', label: 'What-If Simulator', icon: Sliders },
  { id: 'analytics', label: 'Analytics and Reports', icon: BarChart3 },
  { id: 'data-mgmt', label: 'Data Management', icon: Database },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ 
  currentTab, 
  onSelectTab, 
  alertsCount = 0,
  activeRole = 'Transport Operator',
  onStartDemoStory
}) {
  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 select-none transition-colors duration-200">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-teal-600/20">
            <Bus className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">TransitIQ</span>
              <span className="px-1.5 py-0.2 text-[9px] font-extrabold uppercase rounded bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                AI Ops
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Smart Mobility Operations</p>
          </div>
        </div>

        <div className="mt-3 py-1.5 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
          <span className="font-semibold text-slate-700 dark:text-slate-300">CUMTA × Easwari 2026</span>
          <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">PS-4</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-2 pb-1 block">
          Operations Modules
        </span>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          const isAlert = item.id === 'alerts' && alertsCount > 0;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-200 border border-teal-200/80 dark:border-teal-800/80 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                }`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className="px-1.5 py-0.2 text-[9px] font-extrabold uppercase rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {item.badge}
                </span>
              )}

              {isAlert && (
                <span className="px-1.5 py-0.2 text-[9px] font-extrabold rounded-full bg-rose-500 text-white animate-pulse">
                  {alertsCount}
                </span>
              )}
            </button>
          );
        })}

        {/* Separator */}
        <div className="pt-3 pb-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block">
            Public &amp; Presentation
          </span>
        </div>

        {/* Passenger Interface Button */}
        <button
          onClick={() => onSelectTab('passenger')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            currentTab === 'passenger'
              ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-blue-500" />
            <span>Passenger Portal</span>
          </div>
          <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
            Public
          </span>
        </button>

        {/* 17-Step Hackathon Demo Story Walkthrough */}
        <button
          onClick={onStartDemoStory}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-sm hover:from-teal-500 hover:to-emerald-500 transition mt-2"
        >
          <div className="flex items-center gap-2">
            <PlayCircle className="w-4 h-4" />
            <span>17-Step Demo Story</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 opacity-80" />
        </button>
      </nav>

      {/* Footer System Status */}
      <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-[11px]">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
          <span>AI Engine</span>
          <span className="flex items-center gap-1 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
          </span>
        </div>
        <div className="text-[10px] text-slate-400 truncate">
          Depot: <span className="font-semibold text-slate-700 dark:text-slate-300">Vadapalani Central</span>
        </div>
      </div>
    </aside>
  );
}
