"use client";
import { useRef, useEffect, useState } from "react";

/* ── Badge ─────────────────────────────────────── */
export function Badge({ children, variant = "default", className = "" }) {
  const v = {
    default:  "bg-slate-100 text-slate-600 border border-slate-200",
    brand:    "bg-orange-50 text-orange-600 border border-orange-200",
    success:  "bg-green-50  text-green-700  border border-green-200",
    warn:     "bg-amber-50  text-amber-700  border border-amber-200",
    danger:   "bg-red-50    text-red-600    border border-red-200",
    critical: "bg-red-600   text-white       border border-red-700",
    medium:   "bg-blue-50   text-blue-600   border border-blue-200",
    high:     "bg-amber-50  text-amber-700  border border-amber-200",
    expired:  "bg-slate-100 text-slate-400  border border-slate-200",
    unknown:  "bg-slate-100 text-slate-400  border border-slate-200",
    navy:     "bg-navy/8    text-navy        border border-navy/12",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide ${v[variant] || v.default} ${className}`}>
      {children}
    </span>
  );
}

/* ── Button ────────────────────────────────────── */
export function Button({ children, variant = "primary", size = "md", className = "", disabled, onClick, type = "button" }) {
  const base = "inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed select-none";
  const v = {
    primary: "bg-brand text-white shadow-orange hover:bg-brand-hover hover:shadow-orange-lg",
    blue:    "bg-blue text-white shadow-sm hover:brightness-110",
    ghost:   "bg-white text-navy border border-border hover:bg-slate-50 shadow-card",
    subtle:  "bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100",
    success: "bg-ok text-white hover:brightness-110",
    danger:  "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
    navy:    "bg-navy text-white hover:brightness-110",
  };
  const s = {
    xs: "text-xs   px-3   py-1.5",
    sm: "text-sm   px-4   py-2",
    md: "text-sm   px-5   py-2.5",
    lg: "text-base px-6   py-3",
    xl: "text-base px-7   py-3.5 w-full justify-center",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${v[variant] || v.primary} ${s[size] || s.md} ${className}`}>
      {children}
    </button>
  );
}

/* ── Input ─────────────────────────────────────── */
export function Input({ label, id, hint, error, className = "", ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="block text-sm font-semibold text-navy/70">{label}</label>}
      <input id={id}
        className={`inp-light ${error ? "err" : ""} ${className}`}
        {...props} />
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

/* ── Textarea ──────────────────────────────────── */
export function Textarea({ label, id, hint, error, rows = 4, className = "", ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="block text-sm font-semibold text-navy/70">{label}</label>}
      <textarea id={id} rows={rows}
        className={`inp-light resize-none ${error ? "err" : ""} ${className}`}
        {...props} />
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

/* ── Select ────────────────────────────────────── */
export function Select({ label, id, hint, error, options = [], className = "", ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="block text-sm font-semibold text-navy/70">{label}</label>}
      <select id={id}
        className={`inp-light ${error ? "err" : ""} ${className}`}
        style={{ appearance: "none" }}
        {...props}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}

/* ── Card ──────────────────────────────────────── */
export function Card({ children, className = "", onClick, hover = false }) {
  return (
    <div onClick={onClick}
      className={`card-base p-4 ${hover ? "card-hover cursor-pointer" : ""} ${className}`}>
      {children}
    </div>
  );
}

/* ── StatCard ──────────────────────────────────── */
export function StatCard({ label, value, icon, variant = "white", sub }) {
  const variants = {
    white:  "card-base",
    orange: "bg-brand text-white",
    blue:   "bg-blue  text-white",
    green:  "bg-ok    text-white",
    navy:   "bg-navy  text-white",
  };
  const isColored = variant !== "white";
  return (
    <div className={`rounded-2xl p-4 space-y-1 ${variants[variant] || variants.white}`}>
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold uppercase tracking-widest ${isColored ? "text-white/65" : "text-muted"}`}>{label}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className={`text-2xl font-black ${isColored ? "text-white" : "text-navy"}`}>{value}</div>
      {sub && <div className={`text-xs ${isColored ? "text-white/60" : "text-muted"}`}>{sub}</div>}
    </div>
  );
}

/* ── ProgressBar ───────────────────────────────── */
export function ProgressBar({ value = 0, color = "bg-brand", className = "" }) {
  return (
    <div className={`h-1.5 bg-border rounded-full overflow-hidden ${className}`}>
      <div className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

/* ── UrgencyBadge ──────────────────────────────── */
export function UrgencyBadge({ urgency }) {
  const m = {
    medium:   ["medium",   "On Track"],
    high:     ["warn",     "Urgent"],
    critical: ["critical", "Critical"],
    expired:  ["expired",  "Expired"],
    unknown:  ["unknown",  "Unknown"],
  };
  const [v, label] = m[urgency] || m.unknown;
  return <Badge variant={v}>{label}</Badge>;
}

/* ── EmptyState ────────────────────────────────── */
export function EmptyState({ icon = "📭", title, body, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-3 anim-fade-in">
      <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-3xl border border-orange-100">{icon}</div>
      <h3 className="text-base font-bold text-navy">{title}</h3>
      {body && <p className="text-sm text-muted max-w-xs leading-relaxed">{body}</p>}
      {action}
    </div>
  );
}

/* ── BottomSheet ───────────────────────────────── */
export function BottomSheet({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet-panel safe-bottom">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-border rounded-full" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h3 className="text-base font-bold text-navy">{title}</h3>
          <button onClick={onClose}
            className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-muted hover:text-navy hover:bg-slate-100 transition-colors border border-border">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </>
  );
}

/* ── Tabs ──────────────────────────────────────── */
export function Tabs({ tabs = [], active, onChange }) {
  return (
    <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-border">
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={`flex-1 text-sm font-bold py-2 px-3 rounded-lg transition-all duration-150
            ${active === t.id
              ? "bg-white text-brand shadow-sm border border-orange-100"
              : "text-muted hover:text-navy"}`}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ── CountUp ───────────────────────────────────── */
export function CountUp({ target, duration = 1400, prefix = "", suffix = "" }) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !started.current) {
        started.current = true;
        const t0 = Date.now();
        const tick = () => {
          const p = Math.min(1, (Date.now() - t0) / duration);
          const ease = 1 - Math.pow(1 - p, 3);
          setVal(Math.floor(ease * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{prefix}{val.toLocaleString("en-IN")}{suffix}</span>;
}

/* ── Toast ─────────────────────────────────────── */
export function Toast({ message, type = "success", visible }) {
  if (!visible) return null;
  const styles = { success: "toast-success", error: "toast-error", info: "toast-info" };
  return <div className={`toast ${styles[type] || "toast-info"}`}>{message}</div>;
}

/* ── PulsingDot ────────────────────────────────── */
export function PulsingDot({ color = "bg-brand" }) {
  return (
    <span className="dot-wrap">
      <span className={`dot-ping ${color} opacity-60`} style={{ animation: "ping-soft 1.8s ease-out infinite" }} />
      <span className={`dot-core ${color}`} />
    </span>
  );
}
