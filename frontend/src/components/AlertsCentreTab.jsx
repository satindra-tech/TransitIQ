import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Filter, 
  Search, 
  ShieldAlert,
  Check,
  ChevronRight
} from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function AlertsCentreTab({ hour = 9, dayOfWeek = 0, onSimulateRoute }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/api/alerts')
      .then(r => r.json())
      .then(data => {
        setAlerts(data.alerts || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching alerts:', err);
        setLoading(false);
      });
  }, []);

  const handleUpdateStatus = (alertId, newStatus) => {
    fetch(`/api/alerts/${alertId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, comment: `Updated to ${newStatus}` })
    })
      .then(r => r.json())
      .then(updated => {
        setAlerts(prev => prev.map(a => a.alert_id === alertId ? { ...a, status: newStatus } : a));
      })
      .catch(err => console.error('Error updating alert status:', err));
  };

  const filteredAlerts = alerts.filter(a => {
    if (selectedSeverity !== 'ALL' && a.severity !== selectedSeverity) return false;
    if (selectedStatus !== 'ALL' && a.status !== selectedStatus) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return a.route_num.toLowerCase().includes(q) || a.title.toLowerCase().includes(q) || a.corridor.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <StatusBadge status="CRITICAL" size="sm" />
              <span className="text-xs text-slate-500 font-mono">Module 5: Operational Incident Alerts</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Operational Alerts Centre
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mt-1">
              Triages high passenger demand surges, overcrowding risks, and corridor bottlenecks across Chennai bus routes.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 text-xs">
            {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map(s => (
              <button
                key={s}
                onClick={() => setSelectedSeverity(s)}
                className={`px-3 py-1.5 rounded-lg border font-semibold transition ${
                  selectedSeverity === s 
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Status Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Filter by Route, Title, or Corridor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">NEW</option>
              <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List Cards */}
      <div className="space-y-3">
        {filteredAlerts.map(a => (
          <div 
            key={a.alert_id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-bold text-xs text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {a.alert_id}
                </span>
                <span className="font-mono font-bold text-xs text-teal-700 dark:text-teal-300">
                  Route {a.route_num}
                </span>
                <StatusBadge status={a.severity} size="sm" />
                <StatusBadge status={a.status} size="sm" />
                <span className="text-[10px] text-slate-400 font-mono ml-auto">
                  Detected: {a.time_detected} • {a.corridor}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {a.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {a.description}
              </p>
              <div className="text-[11px] text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 p-2 rounded-lg border border-teal-100 dark:border-teal-800/60">
                <strong>Suggested Action:</strong> {a.suggested_action}
              </div>
            </div>

            {/* Status Change Buttons */}
            <div className="flex md:flex-col items-end gap-2 shrink-0">
              {a.status === 'NEW' && (
                <button
                  onClick={() => handleUpdateStatus(a.alert_id, 'ACKNOWLEDGED')}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs"
                >
                  Acknowledge
                </button>
              )}
              {a.status === 'ACKNOWLEDGED' && (
                <button
                  onClick={() => handleUpdateStatus(a.alert_id, 'IN_PROGRESS')}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs"
                >
                  Start Action
                </button>
              )}
              {a.status !== 'RESOLVED' && (
                <button
                  onClick={() => handleUpdateStatus(a.alert_id, 'RESOLVED')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
                >
                  Mark Resolved
                </button>
              )}
              {a.status === 'RESOLVED' && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Issue Closed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
