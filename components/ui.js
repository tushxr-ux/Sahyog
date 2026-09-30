"use client";
import { useState, useRef, useEffect } from "react";

/* ── Badge ────────────────────────────────────────── */
export function Badge({ children, variant = "default", className = "" }) {
  const v = {
    default:  "bg-white/8 text-cream/80 border border-white/10",
    brand:    "bg-brand/15 text-brand-light border border-brand/25",
    success:  "bg-ok/15 text-emerald-400 border border-ok/25",
    warn:     "bg-warn/15 text-amber-400 border border-warn/25",
    danger:   "bg-bad/15 text-red-400 border border-bad/25",
    critical: "bg-bad text-white border border-bad",
    medium:   "bg-brand/15 text-brand-light border border-brand/25",
    high:     "bg-warn/15 text-amber-400 border border-warn/25",
    expired:  "bg-white/6 text-cream/40 border border-white/8",
    unknown:  "bg-white/6 text-cream/40 border border-white/8",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${v[variant] || v.default} ${className}`}>
      {children}
    </span>
  );
}

/* ── Button ───────────────────────────────────────── */
export function Button({ children, variant = "primary", size = "md", className = "", disabled, onClick, type = "button" }) {
  const base = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 active:scale-[0.97] disabled:opacity-35 disabled:cursor-not-allowed select-none";
  const v = {
    primary: "gradient-blue text-white shadow-lg hover:shadow-brand/30 hover:shadow-xl hover:brightness-110",
    orange:  "gradient-orange text-white shadow-lg hover:shadow-orange/30 hover:shadow-xl hover:brightness-110",
    success: "gradient-green text-white shadow-lg hover:shadow-ok/30 hover:shadow-xl hover:brightness-110",
    ghost:   "bg-white/6 text-cream border border-white/10 hover:bg-white/10 hover:border-white/18",
    subtle:  "bg-brand/12 text-brand-light border border-brand/20 hover:bg-brand/18",
    danger:  "bg-bad/15 text-red-400 border border-bad/25 hover:bg-bad/25",
    link:    "text-brand-light hover:text-white underline decoration-brand/40 p-0",
  };
  const s = {
    xs: "text-xs px-3 py-1.5",
    sm: "text-sm px-4 py-2",
    md: "text-sm px-5 py-2.5",
    lg: "text-base px-6 py-3",
    xl: "text-base px-7 py-3.5",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${v[variant] || v.primary} ${s[size] || s.md} ${className}`}>
      {children}
    </button>
  );
}

/* ── Input dark ───────────────────────────────────── */
export function Input({ label, id, hint, error, className = "", ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="block text-sm font-medium text-cream/70">{label}</label>}
      <input id={id}
        className={`w-full rounded-xl input-dark px-4 py-3 text-sm
          ${error ? "border-bad/50 bg-bad/5" : ""} ${className}`}
        {...props} />
      {hint && !error && <p className="text-xs text-cream/40">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

/* ── Textarea dark ────────────────────────────────── */
export function Textarea({ label, id, hint, error, rows = 4, className = "", ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="block text-sm font-medium text-cream/70">{label}</label>}
      <textarea id={id} rows={rows}
        className={`w-full rounded-xl input-dark px-4 py-3 text-sm resize-none
          ${error ? "border-bad/50" : ""} ${className}`}
        {...props} />
      {hint && !error && <p className="text-xs text-cream/40">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

/* ── Select dark ──────────────────────────────────── */
export function Select({ label, id, hint, error, options = [], className = "", ...props }) {
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="block text-sm font-medium text-cream/70">{label}</label>}
      <select id={id}
        className={`w-full rounded-xl input-dark px-4 py-3 text-sm ${error ? "border-bad/50" : ""} ${className}`}
        {...props}>
        {options.map(o => <option key={o.value} value={o.value} style={{ background: "#0d1e30" }}>{o.label}</option>)}
      </select>
      {hint && !error && <p className="text-xs text-cream/40">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

/* ── Card glass ───────────────────────────────────── */
export function Card({ children, className = "", onClick, hover = false, glow }) {
  const glowClass = glow === "blue" ? "glow-blue" : glow === "orange" ? "glow-orange" : glow === "green" ? "glow-green" : "";
  return (
    <div onClick={onClick}
      className={`glass rounded-2xl p-4 ${hover ? "glass-hover cursor-pointer" : ""} ${glowClass} ${className}`}>
      {children}
    </div>
  );
}

/* ── StatCard ─────────────────────────────────────── */
export function StatCard({ label, value, icon, gradient, sub }) {
  return (
    <div className={`rounded-2xl p-4 space-y-1 ${gradient || "glass"}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-cream/50 uppercase tracking-widest">{label}</span>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <div className="text-2xl font-bold text-cream">{value}</div>
      {sub && <div className="text-xs text-cream/40">{sub}</div>}
    </div>
  );
}

/* ── Progress bar ─────────────────────────────────── */
export function ProgressBar({ value = 0, className = "", color = "bg-brand" }) {
  return (
    <div className={`h-1 bg-white/8 rounded-full overflow-hidden ${className}`}>
      <div className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

/* ── Skeleton ─────────────────────────────────────── */
export function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} />;
}

/* ── EmptyState ───────────────────────────────────── */
export function EmptyState({ icon = "📭", title, body, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center space-y-4 animate-fade-in">
      <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-3xl">{icon}</div>
      <div>
        <h3 className="text-base font-semibold text-cream">{title}</h3>
        {body && <p className="text-sm text-cream/50 mt-1 max-w-xs">{body}</p>}
      </div>
      {action}
    </div>
  );
}

/* ── BottomSheet ──────────────────────────────────── */
export function BottomSheet({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-[60] bottom-sheet shadow-2xl animate-slide-up safe-bottom">
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-white/15 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/8">
          <h3 className="text-base font-semibold text-cream">{title}</h3>
          <button onClick={onClose}
            className="w-8 h-8 glass rounded-full flex items-center justify-center text-cream/50 hover:text-cream transition-colors">
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

/* ── Tabs ─────────────────────────────────────────── */
export function Tabs({ tabs = [], active, onChange }) {
  return (
    <div className="flex gap-1 glass p-1 rounded-xl">
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={`flex-1 text-sm font-semibold py-2 px-3 rounded-lg transition-all duration-200
            ${active === t.id
              ? "tab-active"
              : "text-cream/45 hover:text-cream/70"}`}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

/* ── UrgencyBadge ─────────────────────────────────── */
export function UrgencyBadge({ urgency }) {
  const map = {
    medium:   ["medium",  "On Track"],
    high:     ["warn",    "Urgent"],
    critical: ["critical","Critical"],
    expired:  ["expired", "Expired"],
    unknown:  ["unknown", "Unknown"],
  };
  const [v, label] = map[urgency] || map.unknown;
  return <Badge variant={v}>{label}</Badge>;
}

/* ── CountUp ──────────────────────────────────────── */
export function CountUp({ target, duration = 1400, suffix = "", prefix = "" }) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !started.current) {
        started.current = true;
        const start = Date.now();
        const tick = () => {
          const p = Math.min(1, (Date.now() - start) / duration);
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

/* ── Toast ────────────────────────────────────────── */
export function Toast({ message, type = "success", visible }) {
  if (!visible) return null;
  const styles = {
    success: "border-ok/30 bg-ok/10 text-emerald-400",
    error:   "border-bad/30 bg-bad/10 text-red-400",
    info:    "border-brand/30 bg-brand/10 text-brand-light",
  };
  return (
    <div className={`fixed top-5 right-5 z-[100] animate-slide-up glass rounded-xl px-4 py-3 text-sm font-medium border shadow-xl ${styles[type]}`}>
      {message}
    </div>
  );
}

/* ── PulsingDot ───────────────────────────────────── */
export function PulsingDot({ color = "bg-orange" }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className={`animate-ping-soft absolute inline-flex h-full w-full rounded-full ${color} opacity-60`} />
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color}`} />
    </span>
  );
}
