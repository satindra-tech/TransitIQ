import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Shield, 
  Sliders, 
  Users, 
  Save, 
  Check, 
  BellRing,
  Database,
  Lock,
  Key,
  ExternalLink
} from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function SettingsTab({ activeRole = 'Transport Operator' }) {
  const [severeThreshold, setSevereThreshold] = useState(130);
  const [highThreshold, setHighThreshold] = useState(100);
  const [delayThreshold, setDelayThreshold] = useState(10);
  const [googleKey, setGoogleKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings/google-maps-key')
      .then(r => r.json())
      .then(data => {
        if (data.api_key) setGoogleKey(data.api_key);
      })
      .catch(err => console.error(err));
  }, []);

  const handleSave = () => {
    // Save settings and key
    fetch('/api/settings/google-maps-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: googleKey.trim() })
    }).catch(err => console.error(err));

    localStorage.setItem('transitiq_google_maps_key', googleKey.trim());

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const users = [
    { name: "K. Rangarajan", role: "Transport Operator", depot: "Vadapalani Central", email: "rangarajan@mtc.chennai.gov.in", status: "ACTIVE" },
    { name: "M. Saravanan", role: "Depot Manager", depot: "Tambaram Depot", email: "saravanan.depot@mtc.chennai.gov.in", status: "ACTIVE" },
    { name: "Dr. P. Anitha", role: "Transport Analyst", depot: "CUMTA Mobility Cell", email: "anitha.p@cumta.gov.in", status: "ACTIVE" },
    { name: "System Admin", role: "Administrator", depot: "All Depots", email: "admin@transitiq.chennai.gov.in", status: "ACTIVE" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <StatusBadge status="ON TIME" size="sm" />
              <span className="text-xs text-slate-500 font-mono">Module 11: System Administration</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Platform Configurations &amp; Thresholds
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl mt-1">
              Configure operational alert triggers, passenger crowd utilization thresholds, user roles, and data source telemetry feeds.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition shadow-sm flex items-center gap-2"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Changes Saved' : 'Save Configurations'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert Thresholds */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <BellRing className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Crowd-Level &amp; Delay Alert Thresholds
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Critical Overcrowding Trigger:</span>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">&ge; {severeThreshold}% Load</span>
              </div>
              <input
                type="range"
                min="110"
                max="160"
                value={severeThreshold}
                onChange={(e) => setSevereThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
              <span className="text-[10px] text-slate-400 block mt-1">Triggers immediate standby bus recommendation.</span>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-700 dark:text-slate-300 font-medium">High Overcrowding Alert:</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">&ge; {highThreshold}% Load</span>
              </div>
              <input
                type="range"
                min="90"
                max="120"
                value={highThreshold}
                onChange={(e) => setHighThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-[10px] text-slate-400 block mt-1">Triggers frequency increase recommendation.</span>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Corridor Delay Warning:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">&ge; {delayThreshold} minutes</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                value={delayThreshold}
                onChange={(e) => setDelayThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <span className="text-[10px] text-slate-400 block mt-1">Triggers cut-trip short loop shuttle suggestions.</span>
            </div>
          </div>
        </div>

        {/* Google Maps Platform Integration Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Google Maps Platform API
              </h3>
            </div>
            {googleKey ? (
              <StatusBadge status="ON TIME" size="sm" />
            ) : (
              <span className="text-[10px] text-amber-600 font-bold uppercase">Not Set</span>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <label className="text-slate-700 dark:text-slate-300 font-medium block">
              Google Maps API Key:
            </label>
            <input
              type="text"
              placeholder="Paste Google Maps API Key (AIzaSy...)"
              value={googleKey}
              onChange={(e) => setGoogleKey(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 font-mono text-xs text-slate-900 dark:text-white focus:outline-none"
            />
            <p className="text-[11px] text-slate-500">
              Powers Google Streets, Satellite Hybrid, and real-time live traffic in the Live Operations map module.
            </p>
            <div className="pt-2">
              <a 
                href="https://console.cloud.google.com/google/maps-apis/overview" 
                target="_blank" 
                rel="noreferrer"
                className="text-teal-600 dark:text-teal-400 font-semibold hover:underline flex items-center gap-1 text-[11px]"
              >
                Manage API Keys in Google Cloud Console <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* User Management & Role Permissions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Authorized Operational Personnel
            </h3>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Assigned Depot</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {users.map((u, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{u.name}</td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{u.role}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{u.depot}</td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status="LOW" size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
