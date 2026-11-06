import React from 'react';
import { 
  Bus, 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight,
  ShieldAlert,
  Clock,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell 
} from 'recharts';
import StatusBadge from './StatusBadge';

export default function MainDashboardTab({
  data,
  hour = 9,
  dayOfWeek = 0,
  onSelectRoute,
  onNavigateTab,
  onStartDemoStory
}) {
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const {
    total_predicted_demand = 0,
    active_scheduled_buses = 0,
    total_monitored_routes = 60,
    critical_overcrowded_count = 0,
    warning_overcrowded_count = 0,
    high_surge_anomalies = 0,
    corridors_breakdown = [],
    route_evaluations = []
  } = data;

  const totalHighDemandRoutes = critical_overcrowded_count + warning_overcrowded_count;

  // Format hour
  const formatH = (h) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const num = h % 12 === 0 ? 12 : h % 12;
    return `${num}:00 ${ampm}`;
  };

  // Top 4 critical alerts for dashboard panel
  const criticalAlerts = route_evaluations
    .filter(r => r.risk_level === 'Severely Overcrowded')
    .slice(0, 3);

  // Top recommended actions
  const primaryRecommendations = route_evaluations
    .flatMap(r => r.recommendations.map(rec => ({ ...rec, route_num: r.route_num, depot: r.primary_depot })))
    .filter(rec => rec.priority === 'CRITICAL' || rec.priority === 'HIGH')
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* 1. Welcome Message & Quick Context Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
              TransitIQ Smart Mobility Overview
            </h1>
            <StatusBadge status="ON TIME" size="sm" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Welcome back, Transport Operator. Today is <strong className="text-slate-700 dark:text-slate-200">{['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][dayOfWeek]}</strong> at <strong className="text-teal-600 dark:text-teal-400 font-mono">{formatH(hour)}</strong> peak operations.
          </p>
        </div>

        <button
          onClick={onStartDemoStory}
          className="px-4 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs font-bold hover:bg-teal-100 transition shadow-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Launch 17-Step Demo Guide</span>
        </button>
      </div>

      {/* 2. Four Section 10 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Buses */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold uppercase tracking-wider">1. Active Buses</span>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
              <Bus className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white font-mono">
            {active_scheduled_buses}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Scheduled across 18 MTC depots</p>
        </div>

        {/* Card 2: Routes Monitored */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold uppercase tracking-wider">2. Routes Monitored</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-black text-slate-900 dark:text-white font-mono">
            {total_monitored_routes}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Key Chennai arterial corridors</p>
        </div>

        {/* Card 3: High-Demand Routes */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold uppercase tracking-wider">3. High-Demand Routes</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {totalHighDemandRoutes}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Capacity utilization &ge; 100%</p>
        </div>

        {/* Card 4: Active Alerts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-bold uppercase tracking-wider">4. Active Alerts</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-black text-rose-600 dark:text-rose-400 font-mono">
            {critical_overcrowded_count + high_surge_anomalies}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Requiring operational review</p>
        </div>
      </div>

      {/* 3. Demand Trend Chart & Critical Alerts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Demand Trend Chart (Corridors) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Passenger Demand vs Capacity by Corridor
              </h3>
              <p className="text-xs text-slate-500">Hourly volume comparison across major transit spines</p>
            </div>

            <button
              onClick={() => onNavigateTab('live-ops')}
              className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline flex items-center gap-1"
            >
              Open Live Map <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={corridors_breakdown} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis 
                  dataKey="corridor" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  angle={-15} 
                  textAnchor="end" 
                  interval={0}
                />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', color: '#0f172a', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="demand" fill="#0d9488" name="Predicted Demand" radius={[4, 4, 0, 0]} />
                <Bar dataKey="capacity" fill="#94a3b8" name="Bus Capacity" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Critical Alerts Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                Critical Alerts Panel
              </h3>
              <StatusBadge status="CRITICAL" size="sm" />
            </div>

            <div className="space-y-3">
              {criticalAlerts.map((r, i) => (
                <div 
                  key={i}
                  onClick={() => onSelectRoute(r.route_num)}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-teal-500/50 cursor-pointer transition"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-xs text-teal-700 dark:text-teal-300">
                      Route {r.route_num}
                    </span>
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                      {Math.round(r.load_ratio * 100)}% Load
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                    {r.origin} → {r.destination}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                    <span>Depot: {r.primary_depot}</span>
                    <span className="text-rose-600 font-semibold">+{Math.round(r.unmet_demand)} unboarded</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('alerts')}
            className="w-full mt-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
          >
            View All Operational Alerts →
          </button>
        </div>
      </div>

      {/* 4. Recommended Actions Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Recommended Operational Actions
            </h3>
            <p className="text-xs text-slate-500">AI decision-support suggestions ready for operator review</p>
          </div>

          <button
            onClick={() => onNavigateTab('recommendations')}
            className="text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline flex items-center gap-1"
          >
            Review All Recommendations <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {primaryRecommendations.map((rec, i) => (
            <div 
              key={i}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                    Route {rec.route_num}
                  </span>
                  <StatusBadge status={rec.priority === 'CRITICAL' ? 'CRITICAL' : 'HIGH'} size="sm" />
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  {rec.title}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                  {rec.description}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                <span className="text-[10px] text-slate-400">{rec.depot}</span>
                <button
                  onClick={() => onNavigateTab('recommendations')}
                  className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
                >
                  Take Action →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
