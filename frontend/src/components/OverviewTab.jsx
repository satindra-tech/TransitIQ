import React from 'react';
import { 
  Users, 
  Bus, 
  Gauge, 
  AlertOctagon, 
  Clock, 
  TrendingUp, 
  ArrowUpRight,
  ShieldAlert,
  Layers,
  ArrowRight
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
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';

const RISK_COLORS = {
  'Normal': '#10B981',
  'Moderate': '#EAB308',
  'Overcrowded': '#F97316',
  'Severely Overcrowded': '#EF4444'
};

export default function OverviewTab({ data, hour, onSelectRoute, onNavigateTab }) {
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  const {
    total_predicted_demand = 0,
    active_scheduled_buses = 0,
    network_avg_load_pct = 0,
    critical_overcrowded_count = 0,
    significant_delays_count = 0,
    risk_distribution = {},
    corridors_breakdown = [],
    route_evaluations = []
  } = data;

  const pieData = [
    { name: 'Normal (<75%)', value: risk_distribution['Normal'] || 0, color: '#10B981' },
    { name: 'Moderate (75-99%)', value: risk_distribution['Moderate'] || 0, color: '#EAB308' },
    { name: 'Overcrowded (100-129%)', value: risk_distribution['Overcrowded'] || 0, color: '#F97316' },
    { name: 'Severely Overcrowded (≥130%)', value: risk_distribution['Severely Overcrowded'] || 0, color: '#EF4444' },
  ];

  // Top 5 worst affected routes
  const topCriticalRoutes = [...route_evaluations]
    .sort((a, b) => b.load_ratio - a.load_ratio)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 1. Executive Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Network Demand</span>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">
              {total_predicted_demand.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">passengers/hr</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Ground-truth aggregate across Chennai</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Fleet</span>
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
              <Bus className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">
              {active_scheduled_buses}
            </span>
            <span className="text-xs text-slate-400">scheduled buses</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across 18 MTC depots</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Load Factor</span>
            <div className={`p-2 rounded-lg ${network_avg_load_pct > 100 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-white">
              {network_avg_load_pct}%
            </span>
            <span className={`text-xs font-semibold ${network_avg_load_pct > 100 ? 'text-red-400' : 'text-emerald-400'}`}>
              {network_avg_load_pct > 100 ? 'Over Capacity' : 'Within Fleet Limit'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Target threshold: &lt; 85%</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-slate-900/80 border border-red-950/60 rounded-xl p-4 shadow-lg hover:border-red-800/80 transition relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-red-300 uppercase tracking-wider">Critical Overcrowded</span>
            <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-red-400">
              {critical_overcrowded_count}
            </span>
            <span className="text-xs text-red-300/80">routes &gt; 130% load</span>
          </div>
          <p className="text-[11px] text-red-400/70 mt-1">Require immediate standby bus</p>
        </div>

        {/* Metric 5 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Corridor Delays</span>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-amber-400">
              {significant_delays_count}
            </span>
            <span className="text-xs text-slate-400">routes &gt; 10 min delay</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Dwell &amp; traffic congestion</p>
        </div>
      </div>

      {/* 2. Visual Charts Row: Risk Distribution Donut & Corridor Breakdown Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Donut */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
                Network Overcrowding Risk
              </h3>
              <span className="text-xs font-mono text-slate-400">{hour}:00 hrs</span>
            </div>
            <p className="text-xs text-slate-400">Categorization across active routes</p>
          </div>

          <div className="h-52 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
            {pieData.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></span>
                <span className="text-slate-300 font-medium truncate">{p.name.split(' ')[0]}:</span>
                <span className="font-mono font-bold text-white ml-auto">{p.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Corridor Pressure Bar Chart */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                Chennai Corridors Demand vs Capacity
              </h3>
              <p className="text-xs text-slate-400">Passenger volume compared to available fleet seats + standees</p>
            </div>
            <button
              onClick={() => onNavigateTab('map')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
            >
              View on Map <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={corridors_breakdown} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  dataKey="corridor" 
                  stroke="#64748b" 
                  fontSize={10} 
                  angle={-15} 
                  textAnchor="end" 
                  interval={0}
                />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="demand" fill="#38bdf8" name="Passenger Demand" radius={[4, 4, 0, 0]} />
                <Bar dataKey="capacity" fill="#334155" name="Scheduled Capacity" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-slate-400 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#38bdf8]"></span>
              <span>Passenger Demand</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#334155]"></span>
              <span>Bus Fleet Capacity</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Top Critical Overcrowded Routes Action Board */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-400" />
              Top Routes Requiring Operational Intervention
            </h3>
            <p className="text-xs text-slate-400">Routes with highest passenger load ratio during this operating hour</p>
          </div>
          <button
            onClick={() => onNavigateTab('recommendations')}
            className="text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5"
          >
            Review Recommendations <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {topCriticalRoutes.map((r, i) => (
            <div 
              key={i}
              onClick={() => onSelectRoute(r.route_num)}
              className="bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-3.5 cursor-pointer transition shadow hover:shadow-cyan-500/10 group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-base text-cyan-400 group-hover:text-cyan-300">
                  {r.route_num}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  r.risk_level === 'Severely Overcrowded' 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                    : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                }`}>
                  {r.risk_level}
                </span>
              </div>

              <div className="text-xs text-slate-300 font-medium truncate mb-1">
                {r.origin} → {r.destination}
              </div>
              <div className="text-[11px] text-slate-400 truncate mb-3">
                {r.corridor}
              </div>

              {/* Load Ratio Bar */}
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Load Ratio</span>
                  <span className="font-mono font-bold text-white">{Math.round(r.load_ratio * 100)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(100, r.load_ratio * 70)}%`,
                      backgroundColor: r.load_ratio > 1.2 ? '#ef4444' : '#f97316'
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80 text-slate-400">
                <span>Demand: <strong className="text-white font-mono">{Math.round(r.predicted_demand)}</strong></span>
                <span>Cap: <strong className="text-slate-300 font-mono">{r.total_capacity}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
