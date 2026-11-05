import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  Zap, 
  ArrowDownRight,
  Filter,
  Check
} from 'lucide-react';

export default function ReportsTab({ 
  routeEvaluations = [], 
  hour = 9, 
  dayOfWeek = 0,
  networkSummary = {}
}) {
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState({});
  const [alertFilter, setAlertFilter] = useState('ALL');

  // Extract alerts from evaluations
  const alerts = [];
  routeEvaluations.forEach(r => {
    if (r.risk_level === 'Severely Overcrowded') {
      alerts.push({
        id: `severe-${r.route_num}`,
        route_num: r.route_num,
        level: 'CRITICAL',
        title: `Route ${r.route_num}: Critical Overcrowding (${Math.round(r.load_ratio * 100)}%)`,
        description: `Unboarded passenger volume: ${Math.round(r.unmet_demand)} pax. Deploy standby bus from ${r.primary_depot}.`,
        time: `${hour}:00 hrs`,
        corridor: r.corridor
      });
    }
    if (r.anomaly_status === 'High Demand Surge') {
      alerts.push({
        id: `surge-${r.route_num}`,
        route_num: r.route_num,
        level: 'WARNING',
        title: `Route ${r.route_num}: Abnormal Ridership Surge (+${r.demand_deviation_pct}%)`,
        description: `Current demand of ${Math.round(r.predicted_demand)} sharply exceeds historical baseline (${Math.round(r.historical_baseline)}).`,
        time: `${hour}:00 hrs`,
        corridor: r.corridor
      });
    }
    if (r.estimated_delay_min >= 10.0) {
      alerts.push({
        id: `delay-${r.route_num}`,
        route_num: r.route_num,
        level: 'WARNING',
        title: `Route ${r.route_num}: Corridor Bottleneck Delay (+${r.estimated_delay_min} min)`,
        description: `Severe dwell and traffic congestion on ${r.corridor}. Schedule adherence dropped to ${r.schedule_adherence_pct}%.`,
        time: `${hour}:00 hrs`,
        corridor: r.corridor
      });
    }
  });

  const handleAcknowledge = (id) => {
    setAcknowledgedAlerts(prev => ({
      ...prev,
      [id]: new Date().toLocaleTimeString()
    }));
  };

  const filteredAlerts = alerts.filter(a => {
    if (alertFilter !== 'ALL' && a.level !== alertFilter) return false;
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Module 8: Reports &amp; Operational Alerts
              </span>
              <span className="text-xs text-slate-400 font-mono">Operations Hour: {hour}:00</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Operational Audit Reports &amp; Incident Feed
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mt-1">
              Export comprehensive operational reports for CUMTA / MTC planning directors, audit compliance logs, and triage real-time dispatch alerts.
            </p>
          </div>

          {/* Export Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`/api/reports/export?hour=${hour}&day_of_week=${dayOfWeek}`}
              download
              className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition shadow-lg shadow-cyan-600/30 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export CSV Report
            </a>
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4" /> Print / Save PDF
            </button>
          </div>
        </div>
      </div>

      {/* 2. Live Alerts Triage Center */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              Active Operations Incident Queue ({filteredAlerts.length} Active Events)
            </h3>
            <p className="text-xs text-slate-400">
              Corridor alerts generated automatically by the AI anomaly detector
            </p>
          </div>

          <div className="flex gap-1.5 text-xs">
            {['ALL', 'CRITICAL', 'WARNING'].map(lvl => (
              <button
                key={lvl}
                onClick={() => setAlertFilter(lvl)}
                className={`px-2.5 py-1 rounded-lg border font-medium transition ${
                  alertFilter === lvl 
                    ? 'bg-slate-800 border-slate-600 text-white' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No active operational alerts for this filter criteria.
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const isAck = !!acknowledgedAlerts[alert.id];
              const isCrit = alert.level === 'CRITICAL';

              return (
                <div 
                  key={alert.id}
                  className={`p-3.5 rounded-xl border transition flex items-start justify-between gap-4 ${
                    isAck 
                      ? 'bg-slate-950/40 border-slate-800/80 opacity-60' 
                      : isCrit 
                      ? 'bg-red-950/30 border-red-900/60 shadow-lg shadow-red-950/20' 
                      : 'bg-amber-950/20 border-amber-900/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg mt-0.5 ${isCrit ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{alert.title}</span>
                        <span className={`px-2 py-0.2 text-[9px] font-bold rounded uppercase ${
                          isCrit ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {alert.level}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">{alert.description}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1 font-mono">
                        <span>Time: {alert.time}</span>
                        <span>•</span>
                        <span>Corridor: {alert.corridor}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {isAck ? (
                      <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-900">
                        <Check className="w-3 h-3" /> Ack at {acknowledgedAlerts[alert.id]}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. Formal Operational Transit Audit Table Preview */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            Official Operational Audit Summary Report (Preview)
          </h3>
          <p className="text-xs text-slate-400">
            Exported records include Route, Capacity, Predicted Load, Anomaly, Delay, and Recommended Depot Action
          </p>
        </div>

        <div className="overflow-x-auto max-h-96 overflow-y-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider sticky top-0 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Route</th>
                <th className="py-2.5 px-3">Corridor</th>
                <th className="py-2.5 px-3">Depot</th>
                <th className="py-2.5 px-3 text-right">Demand</th>
                <th className="py-2.5 px-3 text-right">Capacity</th>
                <th className="py-2.5 px-3 text-right">Load %</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3 text-right">Delay (min)</th>
                <th className="py-2.5 px-3">Primary Action Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium">
              {routeEvaluations.slice(0, 30).map((r, i) => (
                <tr key={i} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">{r.route_num}</td>
                  <td className="py-2.5 px-3 text-slate-300">{r.corridor}</td>
                  <td className="py-2.5 px-3 text-slate-400">{r.primary_depot}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-white">{Math.round(r.predicted_demand)}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-300">{r.total_capacity}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-white">{Math.round(r.load_ratio * 100)}%</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      r.risk_level === 'Severely Overcrowded'
                        ? 'bg-red-500/20 text-red-400'
                        : r.risk_level === 'Overcrowded'
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {r.risk_level}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-amber-300">+{r.estimated_delay_min}</td>
                  <td className="py-2.5 px-3 text-slate-300 truncate max-w-[220px]">
                    {r.recommendations?.[0]?.title || 'Maintain nominal timetable'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
