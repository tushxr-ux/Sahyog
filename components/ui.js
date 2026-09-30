// Shared primitive UI components
"use client";
import { useState } from "react";

/* ── Badge ──────────────────────────────────────────── */
export function Badge({ children, variant = "default", className = "" }) {
  const variants = {
    default:   "bg-navy/10 text-navy",
    brand:     "bg-brand/10 text-brand",
    success:   "bg-ok/10 text-ok",
    warn:      "bg-warn/10 text-amber-700",
    danger:    "bg-bad/10 text-bad",
    critical:  "bg-bad text-white",
    medium:    "bg-brand/10 text-brand",
    high:      "bg-warn/10 text-amber-700",
    expired:   "bg-navy/20 text-navy/60",
    unknown:   "bg-gray-100 text-gray-500",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}

/* ── Button ─────────────────────────────────────────── */
export function Button({ children, variant = "primary", size = "md", className = "", disabled, onClick, type = "button" }) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed";
  const variants = {
    primary:   "bg-brand text-white hover:bg-brand-hover shadow-sm",
    orange:    "bg-orange text-white hover:bg-orange-hover shadow-sm",
    ghost:     "bg-transparent text-navy hover:bg-navy/6 border border-border",
    danger:    "bg-bad text-white hover:bg-red-700",
    success:   "bg-ok text-white hover:bg-green-700",
    subtle:    "bg-navy/6 text-navy hover:bg-navy/10",
  };
  const sizes = {
    sm: "text-sm px-4 py-2",
    md: "text-sm px-5 py-2.5",
    lg: "text-base px-6 py-3",
    xl: "text-lg px-8 py-4",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  );
}

/* ── Input ──────────────────────────────────────────── */
export function Input({ label, id, hint, error, className = "", ...props }) {
  return (
    <div className="space-y-1">
      {label && <label htmlFor={id} className="block text-sm font-medium text-navy">{label}</label>}
      <input id={id}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-navy placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors
          ${error ? "border-bad bg-bad/5" : "border-border"} ${className}`}
        {...props} />
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs text-bad">{error}</p>}
    </div>
  );
}

/* ── Textarea ───────────────────────────────────────── */
export function Textarea({ label, id, hint, error, className = "", rows = 4, ...props }) {
  return (
    <div className="space-y-1">
      {label && <label htmlFor={id} className="block text-sm font-medium text-navy">{label}</label>}
      <textarea id={id} rows={rows}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-navy placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors resize-none
          ${error ? "border-bad bg-bad/5" : "border-border"} ${className}`}
        {...props} />
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs text-bad">{error}</p>}
    </div>
  );
}

/* ── Select ─────────────────────────────────────────── */
export function Select({ label, id, hint, error, options = [], className = "", ...props }) {
  return (
    <div className="space-y-1">
      {label && <label htmlFor={id} className="block text-sm font-medium text-navy">{label}</label>}
      <select id={id}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-navy
          focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors
          ${error ? "border-bad" : "border-border"} ${className}`}
        {...props}>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs text-bad">{error}</p>}
    </div>
  );
}

/* ── Card ───────────────────────────────────────────── */
export function Card({ children, className = "", onClick, hover = false }) {
  return (
    <div onClick={onClick}
      className={`bg-white rounded-2xl shadow-card p-4 ${hover ? "card-hover cursor-pointer" : ""} ${className}`}>
      {children}
    </div>
  );
}

/* ── Skeleton ───────────────────────────────────────── */
export function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} />;
}

/* ── Progress bar ───────────────────────────────────── */
export function ProgressBar({ value = 0, color = "bg-brand", className = "" }) {
  return (
    <div className={`h-1.5 bg-border rounded-full overflow-hidden ${className}`}>
      <div className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

/* ── Divider ────────────────────────────────────────── */
export function Divider({ className = "" }) {
  return <hr className={`border-border ${className}`} />;
}

/* ── StatCard ───────────────────────────────────────── */
export function StatCard({ label, value, icon, color = "text-brand", sub }) {
  return (
    <Card className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted uppercase tracking-wide">{label}</span>
        {icon && <span className={`text-lg ${color}`}>{icon}</span>}
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-muted">{sub}</div>}
    </Card>
  );
}

/* ── EmptyState ─────────────────────────────────────── */
export function EmptyState({ icon = "📭", title, body, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-3 animate-fade-in">
      <span className="text-4xl">{icon}</span>
      <h3 className="text-base font-semibold text-navy">{title}</h3>
      {body && <p className="text-sm text-muted max-w-xs">{body}</p>}
      {action}
    </div>
  );
}

/* ── UrgencyBadge ───────────────────────────────────── */
export function UrgencyBadge({ urgency }) {
  const map = {
    medium:   { v: "medium",  label: "On Track" },
    high:     { v: "high",    label: "Urgent" },
    critical: { v: "critical", label: "Critical" },
    expired:  { v: "expired", label: "Expired" },
    unknown:  { v: "unknown", label: "Unknown" },
  };
  const { v, label } = map[urgency] || map.unknown;
  return <Badge variant={v}>{label}</Badge>;
}

/* ── BottomSheet ────────────────────────────────────── */
export function BottomSheet({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-modal animate-slide-up safe-bottom">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border">
          <h3 className="text-base font-semibold text-navy">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-navy/6 text-muted transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </>
  );
}

/* ── Tabs ───────────────────────────────────────────── */
export function Tabs({ tabs = [], active, onChange }) {
  return (
    <div className="flex gap-1 bg-navy/6 p-1 rounded-xl">
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={`flex-1 text-sm font-medium py-2 px-3 rounded-lg transition-all duration-150
            ${active === t.id ? "bg-white text-navy shadow-sm" : "text-muted hover:text-navy"}`}>
          {t.label}
        </button>
      ))}
    </div>
  );
}
