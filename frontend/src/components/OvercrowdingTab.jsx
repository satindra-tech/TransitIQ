import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Clock, 
  Zap, 
  TrendingUp, 
  ArrowDownRight, 
  CheckCircle,
  Sliders,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

const RISK_BADGES = {
  'Severely Overcrowded': { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
  'Overcrowded': { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' },
  'Moderate': { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  'Normal': { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' }
};

export default function OvercrowdingTab({ 
  routeEvaluations = [], 
  onSelectRoute, 
  onSimulateRoute,
  hour = 9 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [selectedAnomaly, setSelectedAnomaly] = useState('ALL');
  const [sortField, setSortField] = useState('load_ratio');
  const [sortAsc, setSortAsc] = useState(false);

  // Filter routes
  const filteredRoutes = routeEvaluations.filter(r => {
    // Search
    const matchSearch = 
      r.route_num.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.corridor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.primary_depot.toLowerCase().includes(searchTerm.toLowerCase());
      
    if (!matchSearch) return false;
    
    // Risk filter
    if (selectedRisk !== 'ALL' && r.risk_level !== selectedRisk) return false;
    
    // Anomaly filter
    if (selectedAnomaly === 'SURGE' && r.anomaly_status !== 'High Demand Surge') return false;
    if (selectedAnomaly === 'DROP' && r.anomaly_status !== 'Abnormal Ridership Drop') return false;
    if (selectedAnomaly === 'DELAY' && r.estimated_delay_min < 10.0) return false;
    
    return true;
  });

  // Sort
  filteredRoutes.sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (typeof valA === 'string') {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortAsc ? valA - valB : valB - valA;
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const riskCounts = {
    'Severely Overcrowded': routeEvaluations.filter(r => r.risk_level === 'Severely Overcrowded').length,
    'Overcrowded': routeEvaluations.filter(r => r.risk_level === 'Overcrowded').length,
    'Moderate': routeEvaluations.filter(r => r.risk_level === 'Moderate').length,
    'Normal': routeEvaluations.filter(r => r.risk_level === 'Normal').length
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" /> Modules 3 &amp; 4: Overcrowding &amp; Delays
              </span>
              <span className="text-xs text-slate-400 font-mono">Hour: {hour}:00</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Route Congestion &amp; Anomaly Detection Console
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mt-1">
              Monitors load factors against bus capacity, identifies passenger bottlenecks, and flags abnormal ridership surges (+35%) and transit delays.
            </p>
          </div>

          {/* Quick Risk Tiers Pills */}
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => setSelectedRisk('ALL')}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition ${
                selectedRisk === 'ALL'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All ({routeEvaluations.length})
            </button>
            <button
              onClick={() => setSelectedRisk('Severely Overcrowded')}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition ${
                selectedRisk === 'Severely Overcrowded'
                  ? 'bg-red-600 border-red-500 text-white'
                  : 'bg-red-950/40 border-red-900/60 text-red-300 hover:text-white'
              }`}
            >
              Severe ({riskCounts['Severely Overcrowded']})
            </button>
            <button
              onClick={() => setSelectedRisk('Overcrowded')}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition ${
                selectedRisk === 'Overcrowded'
                  ? 'bg-orange-600 border-orange-500 text-white'
                  : 'bg-orange-950/40 border-orange-900/60 text-orange-300 hover:text-white'
              }`}
            >
              Overcrowded ({riskCounts['Overcrowded']})
            </button>
            <button
              onClick={() => setSelectedRisk('Normal')}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition ${
                selectedRisk === 'Normal'
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-emerald-950/40 border-emerald-900/60 text-emerald-300 hover:text-white'
              }`}
            >
              Normal ({riskCounts['Normal']})
            </button>
          </div>
        </div>

        {/* 2. Search & Sub-Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-800/80">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by Route (e.g. 570, 23C), Corridor, Origin, Destination, or Depot..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 whitespace-nowrap">Filter Anomalies:</span>
            <select
              value={selectedAnomaly}
              onChange={(e) => setSelectedAnomaly(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Operational Statuses</option>
              <option value="SURGE">Surge Only (&gt; +35%)</option>
              <option value="DROP">Abnormal Drop (&lt; -35%)</option>
              <option value="DELAY">Corridor Bottlenecks (&gt; 10 min delay)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Comprehensive Monitoring Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th 
                  onClick={() => handleSort('route_num')}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    Route &amp; Corridor <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Endpoints &amp; Depot</th>
                <th 
                  onClick={() => handleSort('predicted_demand')}
                  className="py-3 px-4 cursor-pointer hover:text-white text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    Demand / Cap <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('load_ratio')}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    Load Ratio &amp; Meter <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Risk Level</th>
                <th 
                  onClick={() => handleSort('estimated_delay_min')}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    Delay &amp; Adherence <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Anomaly Flag</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredRoutes.map((r, i) => {
                const badge = RISK_BADGES[r.risk_level] || RISK_BADGES['Normal'];
                const loadPct = Math.round(r.load_ratio * 100);

                return (
                  <tr key={i} className="hover:bg-slate-800/40 transition">
                    {/* Route Num & Corridor */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-cyan-400 bg-cyan-950/40 border border-cyan-800/50 px-2 py-0.5 rounded-lg">
                          {r.route_num}
                        </span>
                        <div>
                          <span className="text-white font-semibold block text-xs">
                            {r.corridor}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Endpoints & Depot */}
                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="truncate max-w-[200px] font-semibold text-white">
                        {r.origin} → {r.destination}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Depot: <span className="text-slate-300">{r.primary_depot}</span>
                      </div>
                    </td>

                    {/* Demand vs Cap */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="font-mono font-bold text-white text-sm">
                        {Math.round(r.predicted_demand)}{' '}
                        <span className="text-slate-400 font-normal text-xs">/ {r.total_capacity}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {r.scheduled_buses} bus(es) scheduled
                      </div>
                    </td>

                    {/* Load Ratio Meter */}
                    <td className="py-3.5 px-4 min-w-[130px]">
                      <div className="flex items-center justify-between text-xs mb-1 font-mono">
                        <span className="font-bold text-white">{loadPct}%</span>
                        {r.unmet_demand > 0 && (
                          <span className="text-[10px] text-red-400">+{Math.round(r.unmet_demand)} unboarded</span>
                        )}
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.min(100, r.load_ratio * 70)}%`,
                            backgroundColor: r.load_ratio >= 1.3 ? '#ef4444' : r.load_ratio >= 1.0 ? '#f97316' : r.load_ratio >= 0.75 ? '#eab308' : '#10b981'
                          }}
                        ></div>
                      </div>
                    </td>

                    {/* Risk Level Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${badge.bg} ${badge.text} ${badge.border} whitespace-nowrap`}>
                        {r.risk_level}
                      </span>
                    </td>

                    {/* Delay & Adherence */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-xs">
                        <Clock className={`w-3.5 h-3.5 ${r.estimated_delay_min >= 10 ? 'text-amber-400' : 'text-slate-400'}`} />
                        <span className={`font-bold ${r.estimated_delay_min >= 10 ? 'text-amber-300' : 'text-slate-200'}`}>
                          +{r.estimated_delay_min} min
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Adherence: <span className="font-semibold text-slate-300">{r.schedule_adherence_pct}%</span>
                      </div>
                    </td>

                    {/* Anomaly Badge */}
                    <td className="py-3.5 px-4">
                      {r.anomaly_status === 'High Demand Surge' ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 rounded flex items-center gap-1 w-fit">
                          <Zap className="w-2.5 h-2.5" /> Surge (+{r.demand_deviation_pct}%)
                        </span>
                      ) : r.anomaly_status === 'Abnormal Ridership Drop' ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded flex items-center gap-1 w-fit">
                          <ArrowDownRight className="w-2.5 h-2.5" /> Drop ({r.demand_deviation_pct}%)
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-500/70" /> Nominal
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onSimulateRoute(r.route_num)}
                        title="Simulate Operational Relief in What-If Sandbox"
                        className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition shadow"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
