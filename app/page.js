"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { NGOS, STATIONS, COORD } from "@/lib/ngos";
import { analyze, rank, zoneKey } from "@/lib/rules";
import { DEMO_IMPACT, DEMO_USER, NGO_NEEDS, CONTRIBUTION_HISTORY, ITEM_CATEGORIES } from "@/lib/demo";
import {
  Button, Badge, Card, StatCard, Input, Select, Textarea,
  ProgressBar, EmptyState, UrgencyBadge, BottomSheet, Tabs,
  CountUp, Toast, PulsingDot,
} from "@/components/ui";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

/* ── helpers ──────────────────────────────────── */
const nowMin = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };
const fmt = x => {
  const s = Math.max(0, Math.round(x * 60));
  return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60]
    .map(v => String(v).padStart(2, "0")).join(":");
};
const SAMPLES = [
  "80 plates rice dal paneer from a wedding in Kandivali. Veg. Cooked 10 PM, packed 11 PM. Pickup available.",
  "60 veg meals from a catering event in Thakur Village. Cooked 9 PM.",
  "150 plates non-veg biryani in Charkop, cooked 11 PM. Can arrange pickup.",
  "Around 40 veg plates from a family function in Malad. Cooked 7 PM.",
];
const FEED = [
  "🍽 78 meals rescued · Sadadevi Foundation · Kandivali",
  "💙 20 blankets fulfilled · Community Outreach · Mumbai Central",
  "✅ NGO matched in 4 min · Prayatna · Malad",
  "🥘 120 meals rescued · SUPPORT Kitchen · Santacruz",
  "📦 School bags delivered · Child Vision · Dahisar",
  "⚡ Rescue completed · Tweet Foundation · Goregaon",
];

/* ── SVG icon helper ───────────────────────────── */
function Ic({ d, size = 20, sw = 1.8, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      {typeof d === "string" ? <path d={d} /> : d}
    </svg>
  );
}
const I = {
  home:   "M3 12L12 3l9 9M5 10v10h4v-6h6v6h4V10",
  rescue: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  needs:  "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  donate: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  impact: "M22 12h-4l-3 9L9 3l-3 9H2",
  bell:   "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  map:    "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  check:  "M20 6L9 17l-5-5",
  back:   "M19 12H5M12 19l-7-7 7-7",
  close:  "M18 6L6 18M6 6l12 12",
  arr:    "M9 18l6-6-6-6",
  clock:  <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  spin:   "M21 12a9 9 0 1 1-6.219-8.56",
  star:   "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  user:   "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
};

/* ── Live Ticker ─────────────────────────────── */
function Ticker() {
  const items = [...FEED, ...FEED];
  return (
    <div className="ticker-wrap">
      <div className="ticker-track">
        {items.map((t, i) => (
          <span key={i} className="text-xs text-orange-600/70 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-brand inline-block flex-none" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Notification panel ──────────────────────── */
function NotifPanel({ open, onClose }) {
  const notifs = [
    { icon: "✅", title: "Rescue accepted",     body: "Sadadevi Foundation accepted your listing.", time: "2 min ago", unread: true },
    { icon: "⚡", title: "Pickup in 12 min",   body: "Driver is on the way to Kandivali.",          time: "5 min ago", unread: true },
    { icon: "💙", title: "New need near you",  body: "Child Vision needs 20 school bags in Dahisar.", time: "18 min ago", unread: false },
    { icon: "🏆", title: "First rescue done!", body: "You helped redirect 80 meals. Amazing!",       time: "2 days ago", unread: false },
  ];
  return (
    <BottomSheet open={open} onClose={onClose} title="Notifications">
      <div className="space-y-2">
        {notifs.map((n, i) => (
          <div key={i} className={`flex gap-3 p-3 rounded-xl border transition-colors
            ${n.unread ? "bg-orange-50 border-orange-100" : "bg-slate-50 border-border"}`}>
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl flex-none shadow-card border border-border">{n.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-navy">{n.title}</span>
                {n.unread && <span className="w-2 h-2 rounded-full bg-brand flex-none" />}
              </div>
              <p className="text-xs text-muted mt-0.5 leading-snug">{n.body}</p>
              <p className="text-[10px] text-muted/60 mt-1">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}

/* ── Rescue Ring ─────────────────────────────── */
function RescueRing({ left, total = 240 }) {
  const pct = left == null ? 0 : Math.max(0, Math.min(1, left / total));
  const r = 54, c = 2 * Math.PI * r;
  const stroke = left == null ? "#d1d9e8"
    : left <= 0 ? "#DC2626"
    : left < 45 ? "#DC2626"
    : left < 90 ? "#D97706"
    : "#F97316";
  return (
    <div className="relative flex items-center justify-center" style={{ width: 136, height: 136 }}>
      <svg width="136" height="136" viewBox="0 0 136 136">
        <circle cx="68" cy="68" r={r} fill="none" stroke="#f1f5f9" strokeWidth="9" />
        <circle cx="68" cy="68" r={r} fill="none" stroke={stroke} strokeWidth="9"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
          strokeLinecap="round" className="ring-progress" />
      </svg>
      <div className="absolute text-center">
        <div className="text-xl font-black text-navy tabular leading-tight">{left == null ? "--:--" : fmt(left)}</div>
        <div className="text-[9px] text-muted uppercase tracking-wider mt-0.5">remaining</div>
      </div>
    </div>
  );
}

/* ── Timeline ────────────────────────────────── */
function Timeline({ steps }) {
  return (
    <div>
      {steps.map((s, i) => (
        <div key={i} className={`tl-step ${s.done ? "done" : ""}`}>
          <div className={`flex-none w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all
            ${s.done ? "border-ok bg-ok text-white" : s.active ? "border-brand bg-orange-50" : "border-border bg-white"}`}>
            {s.done
              ? <Ic d={I.check} size={12} sw={3} />
              : s.active ? <span className="w-2 h-2 rounded-full bg-brand block" />
              : <span className="w-1.5 h-1.5 rounded-full bg-border block" />}
          </div>
          <div className="pt-0.5">
            <div className={`text-sm font-semibold ${s.done ? "text-navy" : s.active ? "text-brand" : "text-muted"}`}>{s.label}</div>
            {s.sub && <div className="text-xs text-muted mt-0.5">{s.sub}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── NGO Match Card ──────────────────────────── */
function NGOCard({ n, score, reason, onAccept, top }) {
  const eta = parseInt(reason) || 20;
  return (
    <div className={`card-base p-4 space-y-3 card-hover anim-slide-up ${top ? "border-brand/30 shadow-orange" : ""}`}>
      {top && (
        <div className="-mt-1 mb-1">
          <Badge variant="brand">⭐ Best Match</Badge>
        </div>
      )}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-black text-navy text-sm">{n.name}</h4>
          <p className="text-xs text-muted mt-0.5">{n.area} · {n.type}</p>
        </div>
        <div className="text-right flex-none">
          <div className="text-2xl font-black text-brand">{score}</div>
          <div className="text-[10px] text-muted uppercase tracking-wide">score</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[["🕐", `${eta} min`, "ETA"], ["🍽", `${n.needToday}`, "Capacity"], ["🚗", n.pickup === "own" ? "Own" : n.pickup === "volunteer" ? "Vol." : "None", "Pickup"]].map(([emoji, val, lbl]) => (
          <div key={lbl} className="bg-slate-50 rounded-xl p-2 text-center border border-border">
            <div className="text-sm">{emoji}</div>
            <div className="text-xs font-black text-navy">{val}</div>
            <div className="text-[9px] text-muted uppercase tracking-wide">{lbl}</div>
          </div>
        ))}
      </div>
      <ProgressBar value={score} color={top ? "bg-brand" : "bg-slate-300"} />
      <Badge variant={n.food.includes("nonveg") ? "warn" : "success"}>
        {n.food.includes("nonveg") ? "Veg & Non-veg" : "Veg Only"}
      </Badge>
      <Button variant={top ? "primary" : "ghost"} size="sm" className="w-full" onClick={onAccept}>
        Request Pickup →
      </Button>
    </div>
  );
}

/* ══════════════════════════════════════════════ */
/*                     PAGES                      */
/* ══════════════════════════════════════════════ */

/* ── HOME ────────────────────────────────────── */
function HomePage({ setPage }) {
  const h = new Date().getHours();
  const greet = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";

  const actions = [
    { id: "rescue", emoji: "⚡", label: "Rescue Food",   desc: "Redirect surplus food before the rescue window closes.", cls: "card-orange" },
    { id: "needs",  emoji: "💙", label: "Fulfil a Need", desc: "See what local NGOs urgently need right now.",          cls: "card-green"  },
    { id: "donate", emoji: "💰", label: "Support an NGO",desc: "Contribute funds or items to community organisations.", cls: "card-blue"   },
  ];
  const stats = [
    { label: "Meals Rescued",   val: DEMO_IMPACT.mealsRescued,  v: "orange" },
    { label: "Needs Fulfilled", val: DEMO_IMPACT.needsFulfilled, v: "green"  },
    { label: "NGOs Supported",  val: DEMO_IMPACT.ngosSupported,  v: "blue"   },
    { label: "People Reached",  val: DEMO_IMPACT.peopleReached,  v: "navy"   },
  ];
  const feed = [
    { icon: "🍽", text: "78 meals rescued via Sadadevi Foundation", time: "4 min ago" },
    { icon: "💙", text: "20 blankets fulfilled · Community Outreach", time: "11 min ago" },
    { icon: "✅", text: "NGO matched in 4 min · Malad area", time: "23 min ago" },
  ];

  return (
    <div className="space-y-8 anim-fade-in">
      {/* Hero greeting */}
      <div className="hero-band p-6 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-36 h-36 bg-brand/8 rounded-full" />
        <div className="absolute -bottom-6 -left-4 w-24 h-24 bg-blue/6 rounded-full" />
        <div className="relative">
          <p className="text-sm font-semibold text-brand">{greet} 👋</p>
          <h1 className="text-2xl font-black text-navy mt-1 leading-tight">
            How would you like<br />to help today?
          </h1>
          <p className="text-sm text-muted mt-2">{NGOS.length} NGOs active across Mumbai</p>
          <div className="flex items-center gap-2 mt-3">
            <PulsingDot color="bg-ok" />
            <span className="text-xs text-ok font-bold">Live rescue network active</span>
          </div>
        </div>
      </div>

      {/* Action cards */}
      <div className="space-y-3">
        {actions.map(a => (
          <button key={a.id} onClick={() => setPage(a.id)}
            className={`w-full text-left p-4 flex items-center gap-4 ${a.cls} card-hover group transition-all duration-150`}>
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl flex-none shadow-card border border-border">
              {a.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-black text-navy text-sm">{a.label}</div>
              <p className="text-xs text-muted mt-0.5 leading-snug">{a.desc}</p>
            </div>
            <Ic d={I.arr} size={16} className="text-muted group-hover:text-brand flex-none transition-colors" />
          </button>
        ))}
      </div>

      {/* Stats */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black text-muted uppercase tracking-widest">Platform Impact</h2>
          <span className="text-[10px] text-muted bg-slate-100 px-2 py-0.5 rounded-full border border-border">Demo estimates</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {stats.map(s => (
            <StatCard key={s.label} label={s.label} variant={s.v}
              value={<CountUp target={s.val} />} />
          ))}
        </div>
      </div>

      {/* Live activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black text-muted uppercase tracking-widest">Live Activity</h2>
          <PulsingDot color="bg-ok" />
        </div>
        <div className="space-y-2">
          {feed.map((f, i) => (
            <div key={i} className="card-base flex items-center gap-3 px-4 py-3">
              <span className="text-xl flex-none">{f.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-navy font-medium leading-snug">{f.text}</p>
              </div>
              <span className="text-[10px] text-muted flex-none">{f.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Critical needs banner */}
      <div className="card-orange p-4 flex items-center gap-4">
        <div className="w-11 h-11 bg-brand rounded-xl flex items-center justify-center text-xl flex-none text-white shadow-orange">🚨</div>
        <div className="flex-1">
          <div className="text-sm font-black text-navy">{NGO_NEEDS.filter(n => n.priority === "critical").length} critical needs nearby</div>
          <div className="text-xs text-muted mt-0.5">NGOs are waiting for urgent support</div>
        </div>
        <Button variant="primary" size="sm" onClick={() => setPage("needs")}>View →</Button>
      </div>
    </div>
  );
}

/* ── RESCUE ──────────────────────────────────── */
function RescuePage() {
  const [step, setStep]   = useState("compose");
  const [text, setText]   = useState("");
  const [d, setD]         = useState(null);
  const [src, setSrc]     = useState("");
  const [busy, setBusy]   = useState(false);
  const [t, setT]         = useState(nowMin());
  const [pub, setPub]     = useState(null);
  const [pick, setPick]   = useState(null);
  const [otp, setOtp]     = useState("");
  const [ngoInp, setNgoInp] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [mapSel, setMapSel] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [rejSheet, setRejSheet] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });

  useEffect(() => {
    const i = setInterval(() => setT(nowMin() + new Date().getSeconds() / 60), 1000);
    return () => clearInterval(i);
  }, []);

  function flash(message, type = "success") {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(p => ({ ...p, visible: false })), 3000);
  }

  async function parse() {
    setBusy(true);
    try {
      const r = await fetch("/api/parse", { method: "POST", body: JSON.stringify({ text }) });
      const j = await r.json();
      setD(j.data); setSrc(j.source);
      flash("AI structured your listing ✓");
    } catch {
      setD({}); setSrc("Manual entry");
      flash("AI unavailable — fill manually", "info");
    }
    setBusy(false);
    setStep("review");
  }

  const setF = (k, v) => setD({ ...d, [k]: v === "" ? null : v });
  const a = d ? analyze(d, t) : null;
  const canPub = a && !a.missing.length && !a.conflicts.length;
  const live = pub ? analyze(pub, t) : null;
  const m = pub ? rank(pub, live.left ?? 0, NGOS) : null;

  function reset() {
    setStep("compose"); setText(""); setD(null); setPub(null);
    setPick(null); setNgoInp(""); setConfirmed(false); setMapSel(null);
  }

  const urgencyStyle = {
    medium:   { bg: "bg-blue/8   border-blue/20",   label: "text-blue"   },
    high:     { bg: "bg-amber-50 border-amber-200",  label: "text-amber-700" },
    critical: { bg: "bg-red-50   border-red-200",    label: "text-red-600"   },
    expired:  { bg: "bg-slate-100 border-border",    label: "text-muted"  },
    unknown:  { bg: "bg-slate-100 border-border",    label: "text-muted"  },
  };

  /* COMPOSE */
  if (step === "compose") return (
    <div className="space-y-6 anim-fade-in">
      <Toast {...toast} />
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">⚡</span>
          <h1 className="text-2xl font-black text-navy">Rescue Surplus Food</h1>
        </div>
        <p className="text-sm text-muted">Describe naturally — AI structures your listing instantly.</p>
      </div>

      <div className="card-orange p-5 space-y-4">
        <Textarea id="food-msg" rows={5}
          placeholder="I have around 80 meals of rice, dal and paneer left from a wedding in Kandivali. Prepared at 10:00 PM and pickup is possible."
          value={text} onChange={e => setText(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          {SAMPLES.map((s, i) => (
            <button key={i} onClick={() => setText(s)}
              className="text-xs text-orange-600 bg-white border border-orange-200 rounded-xl px-3 py-1.5 hover:bg-orange-50 transition-colors font-medium">
              Sample {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-blue/5 border border-blue/15 rounded-xl p-3 flex gap-2 items-start">
        <Ic d={I.shield} size={14} className="text-blue flex-none mt-0.5" />
        <p className="text-xs text-navy/60">AI extracts only what you explicitly state. Unknown fields stay empty — never invented.</p>
      </div>

      <div className="space-y-2">
        <button onClick={parse} disabled={!text || busy}
          className="btn-cta w-full py-3.5 text-base anim-pulse-o"
          style={{ fontSize: "1rem" }}>
          {busy ? (
            <span className="flex items-center justify-center gap-2">
              <Ic d={I.spin} size={18} className="anim-spin" /> Structuring your donation…
            </span>
          ) : "Generate Listing →"}
        </button>
        <button onClick={() => { setD({}); setSrc("Manual"); setStep("review"); }}
          className="w-full text-center text-sm text-muted hover:text-navy transition-colors py-1 font-medium">
          Skip AI — fill manually
        </button>
      </div>

      <div>
        <button onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2 text-sm text-brand font-bold mb-3 hover:text-brand-hover transition-colors">
          <Ic d={I.map} size={16} />
          {showMap ? "Hide" : "View"} NGO Network ({NGOS.length} NGOs)
        </button>
        {showMap && (
          <div className="rounded-2xl overflow-hidden border border-border shadow-card anim-slide-up">
            <MapView ngos={NGOS} stations={STATIONS} h={260} onPick={setMapSel} />
          </div>
        )}
        {mapSel && (
          <div className="mt-2 card-base p-3 anim-slide-up flex justify-between items-start">
            <div>
              <div className="font-bold text-sm text-navy">{mapSel.name}</div>
              <div className="text-xs text-muted mt-0.5">{mapSel.area} · {mapSel.type}</div>
              <div className="flex gap-2 mt-2">
                <Badge variant={mapSel.food.includes("nonveg") ? "warn" : "success"}>
                  {mapSel.food.includes("nonveg") ? "Veg & Non-veg" : "Veg only"}
                </Badge>
              </div>
            </div>
            <button onClick={() => setMapSel(null)} className="text-muted hover:text-navy transition-colors p-1">
              <Ic d={I.close} size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  /* REVIEW */
  if (step === "review" && d) {
    const opts = [{ value: "", label: "Select type" }, { value: "veg", label: "Vegetarian" }, { value: "nonveg", label: "Non-vegetarian" }];
    return (
      <div className="space-y-5 anim-fade-in">
        <Toast {...toast} />
        <div className="flex items-center gap-3">
          <button onClick={() => setStep("compose")}
            className="w-9 h-9 card-base rounded-xl flex items-center justify-center text-muted hover:text-navy hover:shadow-card-lg transition-all">
            <Ic d={I.back} size={16} />
          </button>
          <div>
            <h1 className="text-xl font-black text-navy">Review Listing</h1>
            <p className="text-xs text-muted">{src.startsWith("AI") ? "AI extracted — verify all fields" : "Manual entry"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-navy/70">Estimated Meals</label>
            <input type="number" placeholder="e.g. 80"
              value={d.meals ?? ""} onChange={e => setF("meals", e.target.value ? +e.target.value : "")}
              className={`inp-light ${!d.meals ? "err" : ""}`} />
            {!d.meals && <p className="text-xs text-red-500 font-medium">Required</p>}
          </div>
          <Select id="ftype" label="Food Type" options={opts}
            value={d.food_type ?? ""} onChange={e => setF("food_type", e.target.value)}
            error={!d.food_type ? "Required" : ""} />
          <Input id="prep" label="Prepared At" type="time"
            value={d.prepared_at ?? ""} onChange={e => setF("prepared_at", e.target.value)}
            error={!d.prepared_at ? "Required" : ""}
            hint={d.prepared_at && src.startsWith("AI") ? "AI extracted — confirm" : ""} />
          <Input id="pack" label="Packed At (optional)" type="time"
            value={d.packed_at ?? ""} onChange={e => setF("packed_at", e.target.value)} />
          <div className="col-span-2">
            <Input id="loc" label="Location / Area" placeholder="e.g. Kandivali"
              value={d.location ?? ""} onChange={e => setF("location", e.target.value)}
              error={!d.location ? "Required" : ""} />
          </div>
          <Input id="temp" label="Temp °C (optional)" type="number"
            value={d.temperature_c ?? ""} onChange={e => setF("temperature_c", e.target.value ? +e.target.value : "")} />
        </div>

        {a?.missing.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700 flex gap-2">
            <span>⚠</span> <span>Required: <strong>{a.missing.join(", ")}</strong></span>
          </div>
        )}
        {a?.conflicts.map(c => (
          <div key={c} className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 flex gap-2">
            <span>✖</span> <span>{c}</span>
          </div>
        ))}

        {/* Safety block */}
        <div className="card-base p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Ic d={I.shield} size={16} className="text-brand" />
            <h3 className="text-sm font-black text-navy">Safety Information</h3>
          </div>
          <div className="space-y-0 divide-y divide-border">
            {[
              ["Preparation time", d.prepared_at],
              ["Packing / holding", d.packed_at],
              ["Food type", d.food_type],
              ["Temperature", d.temperature_c != null ? `${d.temperature_c}°C` : null],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2">
                <span className="text-xs text-muted">{k}</span>
                <span className={`text-xs font-bold ${v ? "text-navy" : "text-muted"}`}>{v || "Not provided"}</span>
              </div>
            ))}
          </div>
          <div className={`rounded-xl px-3 py-2 text-xs font-bold flex items-center gap-2
            ${canPub ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
            {canPub ? "✓ Safety information complete" : "⚠ Additional information required"}
          </div>
          <p className="text-[10px] text-muted">Rescue window is a platform rule (4 hrs from prep) — not a food safety certificate.</p>
        </div>

        <button onClick={() => { setPub(d); setStep("live"); flash("Listing published! Finding NGOs…"); }}
          disabled={!canPub}
          className="btn-cta w-full py-3.5 text-base" style={{ fontSize: "1rem" }}>
          Publish & Match NGOs →
        </button>
      </div>
    );
  }

  /* LIVE */
  if (step === "live" && pub) {
    const urg = live.urgency || "unknown";
    const us = urgencyStyle[urg] || urgencyStyle.unknown;
    const tlSteps = pick ? [
      { label: "Listing Created",    done: true },
      { label: "Safety Reviewed",    done: true },
      { label: "NGO Matched",        done: true },
      { label: "NGO Accepted",       done: true },
      { label: "Pickup In Progress", done: confirmed, active: !confirmed },
      { label: "Handover Complete",  done: confirmed },
    ] : [
      { label: "Listing Created",        done: true },
      { label: "Safety Reviewed",        done: true },
      { label: "Matching Started",       done: true },
      { label: "NGO Acceptance Pending", done: false, active: true },
      { label: "Pickup",                 done: false },
      { label: "Handover",               done: false },
    ];

    return (
      <div className="space-y-5 anim-fade-in">
        <Toast {...toast} />

        {/* Rescue ring card */}
        <div className={`rounded-2xl p-5 flex items-center gap-5 border ${us.bg}`}>
          <RescueRing left={live.left} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <UrgencyBadge urgency={urg} />
              {!pick && !confirmed && <PulsingDot color="bg-brand" />}
            </div>
            <div className="text-xl font-black text-navy">{pub.meals} meals</div>
            <div className="text-sm text-muted mt-0.5 capitalize">{pub.food_type} · {pub.location}</div>
            {live.left != null && live.left > 0 && (
              <div className="mt-3">
                <ProgressBar value={Math.max(0, (live.left / (4 * 60)) * 100)} color="bg-brand" />
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="card-base p-4">
          <h3 className="text-xs font-black text-muted uppercase tracking-widest mb-3">Rescue Progress</h3>
          <Timeline steps={tlSteps} />
        </div>

        {/* Map */}
        {!pick && m && (
          <div className="rounded-2xl overflow-hidden border border-border shadow-card anim-slide-up">
            <MapView ngos={NGOS} stations={STATIONS}
              donor={COORD[zoneKey(pub.location)]}
              hi={m.ranked.slice(0, 3).map(r => r.n.id)} h={220} onPick={setMapSel} />
          </div>
        )}

        {/* States */}
        {live.left <= 0 ? (
          <div className="card-critical p-5 space-y-2">
            <div className="text-red-600 font-black">Rescue Window Expired</div>
            <p className="text-sm text-muted">Human food matching has ended. Contact animal feed or composting partners.</p>
          </div>
        ) : confirmed ? (
          <div className="flex flex-col items-center py-12 space-y-4 anim-slide-up">
            <div className="w-20 h-20 bg-ok rounded-3xl flex items-center justify-center text-white text-4xl shadow-[0_6px_24px_rgba(22,163,74,0.3)]">✓</div>
            <h2 className="text-2xl font-black text-navy">Rescue Completed!</h2>
            <p className="text-sm text-muted text-center">{pub.meals} meals redirected to <strong className="text-navy">{pick.n.name}</strong></p>
            <div className="card-base p-4 w-full space-y-0 divide-y divide-border text-sm">
              {[["NGO", pick.n.name], ["Meals rescued", pub.meals], ["Type", pub.food_type]].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2.5">
                  <span className="text-muted">{k}</span>
                  <span className="font-black text-navy capitalize">{v}</span>
                </div>
              ))}
            </div>
            <Button variant="primary" size="lg" onClick={reset}>Start New Rescue</Button>
          </div>
        ) : pick ? (
          /* OTP Handover */
          <div className="space-y-4">
            <h2 className="font-black text-navy text-lg">Handover</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Donor */}
              <div className="card-orange p-5 space-y-4">
                <div className="text-xs text-muted font-bold uppercase tracking-widest">Donor Screen</div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white">
                    <Ic d={I.user} size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-black text-navy">{pick.n.name} accepted</div>
                    <div className="text-xs text-muted">Pickup estimated in ~15 min</div>
                  </div>
                </div>
                <div className="text-center py-4">
                  <div className="text-xs text-muted uppercase tracking-widest mb-2">Handover Code</div>
                  <div className="text-6xl font-black tracking-[0.2em] text-brand tabular">{otp}</div>
                  <p className="text-xs text-muted mt-3 max-w-[180px] mx-auto">Share only when food is physically handed over</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-xs font-bold text-green-700 flex gap-2 items-center">
                  <PulsingDot color="bg-ok" /> Pickup in progress
                </div>
              </div>

              {/* NGO */}
              <div className="card-base p-5 space-y-4">
                <div className="text-xs text-muted font-bold uppercase tracking-widest">NGO Screen</div>
                {ngoInp === "ok" ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-3 anim-slide-up">
                    <div className="w-16 h-16 bg-ok rounded-2xl flex items-center justify-center text-white text-3xl">✓</div>
                    <p className="font-black text-ok">Delivered!</p>
                    <p className="text-sm text-muted">{pub.meals} meals rescued</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-navy border border-border">
                        <Ic d={I.user} size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-black text-navy">Confirm Handover</div>
                        <div className="text-xs text-muted">Enter the donor's 4-digit code</div>
                      </div>
                    </div>
                    <Input id="otp-inp" label="Handover Code" placeholder="0000"
                      value={ngoInp} onChange={e => setNgoInp(e.target.value)}
                      className="text-center text-2xl tracking-[0.3em] font-black" />
                    <Button variant="success" size="lg" className="w-full"
                      disabled={ngoInp.length < 4}
                      onClick={() => {
                        if (ngoInp === otp) { setNgoInp("ok"); setConfirmed(true); flash("Rescue completed! 🎉"); }
                        else flash("Incorrect code", "error");
                      }}>
                      Confirm Handover
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : m.ranked.length === 0 ? (
          <EmptyState icon="📍" title="No eligible NGOs found"
            body="Try expanding the rescue zone or contact volunteers to escalate."
            action={<Button variant="ghost" onClick={reset}>Start New Listing</Button>} />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-navy text-lg">Best Matches</h2>
              <span className="text-xs text-muted">{m.ranked.length} eligible</span>
            </div>
            <div className="space-y-3">
              {m.ranked.slice(0, 3).map(({ n, score, reason }, i) => (
                <NGOCard key={n.id} n={n} score={score} reason={reason} top={i === 0}
                  onAccept={() => { setPick({ n }); setOtp(String(1000 + Math.floor(Math.random() * 9000))); flash(`${n.name} will pick up in ~${parseInt(reason)} min`); }} />
              ))}
            </div>
            {m.rejected.length > 0 && (
              <button onClick={() => setRejSheet(true)} className="text-sm text-muted underline hover:text-navy transition-colors">
                Why were {m.rejected.length} NGO{m.rejected.length > 1 ? "s" : ""} excluded?
              </button>
            )}
            <BottomSheet open={rejSheet} onClose={() => setRejSheet(false)} title="Excluded NGOs">
              <div className="space-y-2">
                {m.rejected.map(({ n, why }) => (
                  <div key={n.id} className="bg-slate-50 rounded-xl p-3 border border-border">
                    <div className="text-sm font-bold text-navy">{n.name}</div>
                    <div className="text-xs text-muted mt-1">{why.join(" · ")}</div>
                  </div>
                ))}
              </div>
            </BottomSheet>
          </div>
        )}

        <button onClick={reset} className="text-sm text-muted hover:text-navy transition-colors font-medium">
          ← Start a new listing
        </button>
      </div>
    );
  }

  return null;
}

/* ── NEEDS ───────────────────────────────────── */
function NeedsPage() {
  const [tab, setTab] = useState("needs");
  const [helped, setHelped] = useState({});
  const [toast, setToast] = useState({ visible: false, message: "" });

  function markHelp(id) {
    setHelped(p => ({ ...p, [id]: true }));
    setToast({ visible: true, message: "Marked! A coordinator will be in touch. 🙏" });
    setTimeout(() => setToast(p => ({ ...p, visible: false })), 3000);
  }

  const pStyle = {
    critical: { cls: "card-critical", badge: "critical" },
    high:     { cls: "card-orange",   badge: "warn"     },
    medium:   { cls: "card-blue",     badge: "medium"   },
  };

  return (
    <div className="space-y-6 anim-fade-in">
      <Toast {...toast} />
      <div>
        <h1 className="text-2xl font-black text-navy">Community Needs</h1>
        <p className="text-sm text-muted mt-1">What local NGOs need right now.</p>
      </div>

      <Tabs
        tabs={[{ id: "needs", label: "Current Needs" }, { id: "categories", label: "Donate Items" }]}
        active={tab} onChange={setTab} />

      {tab === "needs" && (
        <div className="space-y-3">
          {NGO_NEEDS.map(n => {
            const p = pStyle[n.priority] || pStyle.medium;
            return (
              <div key={n.id} className={`p-4 space-y-3 card-hover ${p.cls}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-navy">{n.qty} {n.item}</span>
                      <Badge variant={p.badge}>{n.priority}</Badge>
                    </div>
                    <p className="text-xs text-muted mt-0.5">{n.ngoName}</p>
                    <p className="text-xs text-muted">{n.category} · {n.area}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted flex items-center gap-1">
                    <Ic d={I.clock} size={12} className="text-muted" />
                    Needed by {n.deadline}
                  </span>
                  {helped[n.id]
                    ? <Badge variant="success">✓ You're helping</Badge>
                    : <Button variant="primary" size="sm" onClick={() => markHelp(n.id)}>I Can Help</Button>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "categories" && (
        <div className="grid grid-cols-2 gap-3">
          {ITEM_CATEGORIES.map(cat => (
            <div key={cat.id} className="card-base card-hover p-4 cursor-pointer">
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="text-sm font-black text-navy">{cat.label}</div>
              <div className={`text-xs mt-0.5 font-semibold ${cat.count > 0 ? "text-brand" : "text-muted"}`}>
                {cat.count > 0 ? `${cat.count} NGOs need this` : "No requests"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── DONATE ──────────────────────────────────── */
function DonatePage() {
  const [donated, setDonated] = useState(null);
  const AMOUNTS = [100, 250, 500, 1000];

  if (donated) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-5 anim-slide-up">
      <div className="w-24 h-24 bg-ok rounded-3xl flex items-center justify-center text-white text-5xl shadow-[0_6px_24px_rgba(22,163,74,0.3)]">✓</div>
      <div className="text-center">
        <h2 className="text-2xl font-black text-navy">Thank You!</h2>
        <p className="text-sm text-muted mt-2">
          <strong className="text-navy">₹{donated.amount}</strong> → <strong className="text-navy">{donated.ngo}</strong>
        </p>
        <Badge variant="warn" className="mt-3">Demo — No real payment processed</Badge>
      </div>
      <Button variant="ghost" onClick={() => setDonated(null)}>Donate to Another NGO</Button>
    </div>
  );

  return (
    <div className="space-y-6 anim-fade-in">
      <div>
        <h1 className="text-2xl font-black text-navy">Support an NGO</h1>
        <p className="text-sm text-muted mt-1">Contribute funds to community organizations.</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-2 items-center text-sm text-amber-700 font-medium">
        <span>ℹ️</span>
        <span>Demo mode — no real payment processed.</span>
      </div>

      <div className="space-y-4">
        {NGOS.slice(0, 5).map(n => {
          const raised = ((n.id * 13000) % 40000) + 10000;
          const pct = Math.round((raised / 60000) * 100);
          return (
            <div key={n.id} className="card-base p-5 space-y-4 card-hover">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-black text-navy">{n.name}</div>
                  <div className="text-xs text-muted mt-0.5">{n.area} · {n.type}</div>
                </div>
                <Badge variant={n.food.includes("nonveg") ? "warn" : "success"}>
                  {n.food.includes("nonveg") ? "Veg & Non-veg" : "Veg"}
                </Badge>
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted mb-1.5">
                  <span>₹{raised.toLocaleString("en-IN")} raised</span>
                  <span>{pct}% of ₹60,000</span>
                </div>
                <ProgressBar value={pct} color="bg-ok" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {AMOUNTS.map(a => (
                  <Button key={a} variant="ghost" size="sm" onClick={() => setDonated({ ngo: n.name, amount: a })}>₹{a}</Button>
                ))}
                <Button variant="subtle" size="sm" onClick={() => setDonated({ ngo: n.name, amount: 2000 })}>Custom</Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── IMPACT ──────────────────────────────────── */
function ImpactPage() {
  return (
    <div className="space-y-8 anim-fade-in">
      {/* Header */}
      <div className="hero-band p-6 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-brand/6 rounded-full" />
        <div className="relative">
          <div className="text-sm font-bold text-brand">Your SAHYOG Impact</div>
          <div className="text-2xl font-black text-navy mt-1">Tushar Salunkhe</div>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge variant="brand">⭐ Active Contributor</Badge>
            <Badge variant="success">🍽 Food Rescuer</Badge>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Meals Supported", val: DEMO_USER.mealsSupported, v: "orange", icon: "🍽️" },
          { label: "Needs Fulfilled", val: DEMO_USER.needsFulfilled,  v: "green",  icon: "✅" },
          { label: "Items Donated",   val: DEMO_USER.itemsDonated,    v: "blue",   icon: "📦" },
          { label: "Contributed",     val: null,                       v: "navy",   icon: "💰", custom: `₹${DEMO_USER.contributed.toLocaleString("en-IN")}` },
        ].map(s => (
          <StatCard key={s.label} label={s.label} variant={s.v} icon={s.icon}
            value={s.custom || <CountUp target={s.val} />} />
        ))}
      </div>

      {/* History */}
      <div>
        <h2 className="text-xs font-black text-muted uppercase tracking-widest mb-3">Contribution History</h2>
        <div className="space-y-2">
          {CONTRIBUTION_HISTORY.map(c => (
            <div key={c.id} className="card-base flex items-center gap-3 px-4 py-3 card-hover">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base flex-none text-white
                ${c.type === "Food Rescue" ? "bg-brand" : c.type === "Donation" ? "bg-ok" : "bg-blue"}`}>
                {c.type === "Food Rescue" ? "🥘" : c.type === "Donation" ? "💰" : "📦"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-navy truncate">{c.ngo}</div>
                <div className="text-xs text-muted">{c.date} · {c.type}</div>
              </div>
              <div className="text-right flex-none">
                <Badge variant="success">{c.status}</Badge>
                <div className="text-xs text-muted mt-1">
                  {c.meals ? `${c.meals} meals` : c.amount ? `₹${c.amount}` : c.item}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Impact Day */}
      <div className="bg-navy rounded-3xl p-6 space-y-4 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand/20 rounded-full" />
        <div className="relative">
          <div className="text-xs font-bold text-white/50 uppercase tracking-widest">Annual Recognition</div>
          <div className="text-xl font-black mt-1">2026 SAHYOG Impact Day 🏆</div>
          <p className="text-sm text-white/60 mt-2">Download your personalised impact certificate for the year.</p>
          <div className="grid grid-cols-2 gap-2 mt-4 text-sm bg-white/8 rounded-xl p-3">
            {[["4,850", "Meals rescued"], ["28", "Needs fulfilled"], ["₹32,500", "Contributed"], ["140", "Items donated"]].map(([v, k]) => (
              <div key={k} className="text-center py-1">
                <div className="font-black text-white">{v}</div>
                <div className="text-[10px] text-white/40">{k}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="ghost" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">View Report</Button>
            <button className="btn-cta px-4 py-2 text-sm rounded-xl">Download Certificate</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════ */
/*                  NAVIGATION                    */
/* ══════════════════════════════════════════════ */

const NAV = [
  { id: "home",   label: "Home",    d: I.home },
  { id: "rescue", label: "Rescue",  d: I.rescue, highlight: true },
  { id: "needs",  label: "Needs",   d: I.needs },
  { id: "donate", label: "Donate",  d: I.donate },
  { id: "impact", label: "Impact",  d: I.impact },
];

function Sidebar({ active, set, onNotif }) {
  return (
    <aside className="hidden lg:flex flex-col w-60 xl:w-64 min-h-screen sidebar-panel sticky top-0 border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <img src="/logo.png" alt="SAHYOG" className="h-9 w-auto" />
        <div>
          <div className="font-black text-navy text-sm leading-tight">SAHYOG</div>
          <div className="text-[9px] text-muted font-semibold leading-tight">Connecting Needs. Creating Impact.</div>
        </div>
      </div>

      {/* Status */}
      <div className="px-4 py-2.5 border-b border-border">
        <div className="flex items-center gap-2 text-xs text-muted font-semibold">
          <PulsingDot color="bg-ok" />
          <span>Live · {NGOS.length} NGOs active</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {NAV.map(item => (
          <button key={item.id} onClick={() => set(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-150
              ${active === item.id
                ? "bg-orange-50 text-brand border border-orange-200"
                : "text-muted hover:text-navy hover:bg-slate-50"}`}>
            <Ic d={item.d} size={18} sw={active === item.id ? 2.2 : 1.7}
              className={active === item.id ? "text-brand" : "text-muted"} />
            {item.label}
            {item.id === "needs" && active !== "needs" && (
              <span className="ml-auto text-[10px] font-black text-white bg-brand px-1.5 py-0.5 rounded-full">
                {NGO_NEEDS.filter(n => n.priority === "critical").length}
              </span>
            )}
            {item.id === "rescue" && active !== "rescue" && (
              <span className="ml-auto"><PulsingDot color="bg-brand" /></span>
            )}
          </button>
        ))}
      </nav>

      {/* Notif + footer */}
      <div className="px-4 pb-5 border-t border-border pt-3">
        <button onClick={onNotif}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-muted hover:text-navy hover:bg-slate-50 transition-all relative notif-rel">
          <Ic d={I.bell} size={18} className="text-muted" />
          Notifications
        </button>
        <div className="mt-3 px-1 text-[10px] text-muted">Mumbai NGO Network · Demo data only</div>
      </div>
    </aside>
  );
}

function BottomNav({ active, set, onNotif }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bottom-nav-panel safe-bottom lg:hidden">
      <div className="flex">
        {NAV.map(item => (
          <button key={item.id} onClick={() => set(item.id)}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-all
              ${active === item.id ? "text-brand" : "text-muted hover:text-navy"}`}>
            {item.highlight ? (
              <>
                <div className={`absolute -top-4 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all
                  ${active === item.id ? "bg-brand shadow-orange" : "bg-brand shadow-orange"}`}>
                  <Ic d={item.d} size={20} sw={2} className="text-white" />
                </div>
                <span className="text-[10px] font-bold mt-4">{item.label}</span>
              </>
            ) : (
              <>
                <Ic d={item.d} size={20} sw={active === item.id ? 2.2 : 1.7} />
                <span className="text-[10px] font-bold">{item.label}</span>
                {item.id === "needs" && (
                  <span className="absolute top-2 right-[18%] w-4 h-4 text-[9px] font-black bg-brand text-white rounded-full flex items-center justify-center">
                    {NGO_NEEDS.filter(n => n.priority === "critical").length}
                  </span>
                )}
              </>
            )}
          </button>
        ))}
        <button onClick={onNotif}
          className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-muted hover:text-navy relative notif-rel">
          <Ic d={I.bell} size={20} sw={1.7} />
          <span className="text-[10px] font-bold">Alerts</span>
        </button>
      </div>
    </nav>
  );
}

function MobileHeader({ onNotif }) {
  return (
    <header className="mobile-header-panel sticky top-0 z-30 lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="SAHYOG" className="h-8 w-auto" />
          <div>
            <div className="text-sm font-black text-navy leading-tight">SAHYOG</div>
            <div className="text-[9px] text-muted font-semibold leading-tight">Connecting Needs. Creating Impact.</div>
          </div>
        </div>
        <button onClick={onNotif}
          className="w-9 h-9 bg-white rounded-xl border border-border shadow-card flex items-center justify-center text-muted hover:text-navy transition-colors notif-rel">
          <Ic d={I.bell} size={18} />
        </button>
      </div>
      <Ticker />
    </header>
  );
}

/* ── ROOT ────────────────────────────────────── */
export default function App() {
  const [page, setPage] = useState("home");
  const [notif, setNotif] = useState(false);

  const pages = {
    home:   <HomePage setPage={setPage} />,
    rescue: <RescuePage />,
    needs:  <NeedsPage />,
    donate: <DonatePage />,
    impact: <ImpactPage />,
  };

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar active={page} set={setPage} onNotif={() => setNotif(true)} />
      <main className="flex-1 min-w-0 pb-28 lg:pb-0">
        <MobileHeader onNotif={() => setNotif(true)} />

        {/* Desktop ticker */}
        <div className="hidden lg:block sticky top-0 z-20 bg-cream/95 backdrop-blur border-b border-border">
          <Ticker />
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 lg:px-8 lg:py-8">
          {pages[page] || pages.home}
        </div>
      </main>
      <BottomNav active={page} set={setPage} onNotif={() => setNotif(true)} />
      <NotifPanel open={notif} onClose={() => setNotif(false)} />
    </div>
  );
}
