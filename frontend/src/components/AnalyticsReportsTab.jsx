import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Printer, 
  FileText, 
  Calendar, 
  Clock, 
  ShieldCheck,
  CheckCircle2,
  Layers
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

export default function AnalyticsReportsTab({ hour = 9, dayOfWeek = 0, routeEvaluations = [] }) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/analytics?hour=${hour}&day_of_week=${dayOfWeek}`)
      .then(r => r.json())
      .then(data => {
        setAnalyticsData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching analytics:', err);
        setLoading(false);
      });
  }, [hour, dayOfWeek]);

  const hourlyTrend = analyticsData?.hourly_network_trend || [];
  const corridorPerf = analyticsData?.corridors_performance || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <StatusBadge status="COMPLETED" size="sm" />
              <span className="text-xs text-slate-500 font-mono">Module 9: Analytics &amp; Reports</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Historical Transit Analytics &amp; Accuracy Report
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mt-1">
              Deep dive into long-term passenger demand trends, corridor performance, capacity utilization, and AI regression model accuracy.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`/api/reports/export?hour=${hour}&day_of_week=${dayOfWeek}`}
              download
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition shadow-sm flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export CSV
            </a>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4" /> Print PDF
            </button>
          </div>
        </div>
      </div>

      {/* Model Accuracy Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Prediction Accuracy (R²)
          </span>
          <div className="text-3xl font-black text-teal-600 dark:text-teal-400 font-mono">
            74.25%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Evaluated on 2,406 unseen test trips</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Mean Absolute Error (MAE)
          </span>
          <div className="text-3xl font-black text-blue-600 dark:text-blue-400 font-mono">
            19.48
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Average deviation in passengers</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Root Mean Squared Error (RMSE)
          </span>
          <div className="text-3xl font-black text-slate-800 dark:text-slate-200 font-mono">
            28.49
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Standardized variance penalty</p>
        </div>
      </div>

      {/* Hourly Trend Across Operating Day Area Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Network-Wide Passenger Demand Trend Across 24 Hours
            </h3>
            <p className="text-xs text-slate-500">Total passengers vs active scheduled fleet capacity</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="trendDemand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', color: '#0f172a', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="demand" stroke="#0d9488" strokeWidth={2} name="Total Demand" fill="url(#trendDemand)" />
              <Area type="monotone" dataKey="capacity" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" name="Fleet Capacity" fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Route-Wise Performance Summary Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Route Performance &amp; Capacity Utilization Audit Table
        </h3>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Route</th>
                <th className="py-2.5 px-3">Corridor</th>
                <th className="py-2.5 px-3">Depot</th>
                <th className="py-2.5 px-3 text-right">Predicted Demand</th>
                <th className="py-2.5 px-3 text-right">Capacity</th>
                <th className="py-2.5 px-3 text-right">Utilization %</th>
                <th className="py-2.5 px-3">Crowd Status</th>
                <th className="py-2.5 px-3 text-right">Delay (min)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {routeEvaluations.slice(0, 15).map((r, i) => {
                const util = Math.round(r.load_ratio * 100);
                const badge = util >= 130 ? 'CRITICAL' : util >= 100 ? 'HIGH' : util >= 75 ? 'MODERATE' : 'LOW';

                return (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-mono font-bold text-teal-600 dark:text-teal-400">{r.route_num}</td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{r.corridor}</td>
                    <td className="py-2.5 px-3 text-slate-500">{r.primary_depot}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">{Math.round(r.predicted_demand)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-500">{r.total_capacity}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">{util}%</td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={badge} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-amber-600">+{r.estimated_delay_min} min</td>
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
