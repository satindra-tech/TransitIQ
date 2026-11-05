import React from 'react';

/**
 * Section 10 Badge Theme:
 * LOW – Green
 * MODERATE – Blue or Amber
 * HIGH – Amber
 * CRITICAL – Red
 * ON TIME – Green
 * DELAYED – Red
 * AI SUGGESTED – Blue
 * AWAITING REVIEW – Amber
 * COMPLETED – Green
 * NO DATA – Gray
 * SIMULATED – Gray
 */

const BADGE_STYLES = {
  // Crowd & Severity
  'LOW': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  'MODERATE': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
  'HIGH': 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  'CRITICAL': 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
  
  // Service Status
  'ON TIME': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  'DELAYED': 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
  
  // AI & Workflow Status
  'AI SUGGESTED': 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
  'AWAITING REVIEW': 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  'IN PROGRESS': 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
  'COMPLETED': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  'RESOLVED': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  'ACCEPTED': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
  'REJECTED': 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  'NEW': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
  'ACKNOWLEDGED': 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',

  // Data Source Badges
  'NO DATA': 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  'SIMULATED': 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  'WITHIN CAPACITY': 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
};

export default function StatusBadge({ status, size = 'md', className = '' }) {
  if (!status) return null;
  const normalized = String(status).toUpperCase().trim();
  const style = BADGE_STYLES[normalized] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300';
  
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-[10px]' 
    : size === 'lg' 
    ? 'px-3 py-1 text-xs' 
    : 'px-2.5 py-0.5 text-[11px]';

  return (
    <span className={`inline-flex items-center gap-1 font-bold uppercase tracking-wider rounded-full border shadow-xs ${sizeClasses} ${style} ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80"></span>
      <span>{status}</span>
    </span>
  );
}
