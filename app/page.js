"use client";
import { useState, useEffect, useRef, useCallback } from "react";
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

/* ── Helpers ──────────────────────────────────────── */
const nowMin = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };
const fmtCountdown = x => {
  const s = Math.max(0, Math.round(x * 60));
  return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60]
    .map(v => String(v).padStart(2, "0")).join(":");
};
const SAMPLES = [
  "80 plates rice dal paneer from a wedding in Kandivali. Veg. Cooked 10 PM, packed 11:10 PM. Pickup available.",
  "60 vegetarian meals from a catering event in Thakur Village. Cooked 9 PM, packed 8 PM.",
  "150 plates non-veg biryani in Charkop, cooked 11 PM tonight. Can arrange pickup.",
  "Around 40 veg plates from a family function in Malad. Cooked 7 PM.",
];
const LIVE_FEED = [
  "🍽 78 meals rescued · Sadadevi Foundation · Kandivali",
  "💙 20 blankets fulfilled · Community Outreach · Mumbai Central",
  "✅ NGO matched in 4 min · Prayatna · Malad",
  "🥘 120 meals rescued · SUPPORT Kitchen · Santacruz",
  "📦 School bags delivered · Child Vision · Dahisar",
  "⚡ Rescue in 11 min · Tweet Foundation · Goregaon",
];

/* ── SVG Icons ────────────────────────────────────── */
const Icon = ({ d, size = 20, sw = 1.8, fill = "none", ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={sw} {...p}>
    {typeof d === "string" ? <path d={d} /> : d}
  </svg>
);
const icons = {
  home:     "M3 12L12 3l9 9M5 10v10h4v-6h6v6h4V10",
  rescue:   "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  needs:    "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  donate:   "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  impact:   "M22 12h-4l-3 9L9 3l-3 9H2",
  bell:     "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  map:      "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  check:    "M20 6L9 17l-5-5",
  back:     "M19 12H5M12 19l-7-7 7-7",
  close:    "M18 6L6 18M6 6l12 12",
  arrow:    "M9 18l6-6-6-6",
  clock:    <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  spin:     "M21 12a9 9 0 1 1-6.219-8.56",
  user:     "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  ngo:      "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  star:     "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  shield:   "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  calendar: "M3 4h18v18H3zM16 2v4M8 2v4M3 10h18",
  gift:     "M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z",
  trending: "M23 6l-9.5 9.5-5-5L1 18",
};

/* ── Live Activity Ticker ─────────────────────────── */
function LiveTicker() {
  const items = [...LIVE_FEED, ...LIVE_FEED];
  return (
    <div className="relative overflow-hidden py-2.5 border-y border-white/6"
      style={{ background: "rgba(26,111,224,0.06)" }}>
      <div className="flex gap-12 animate-ticker whitespace-nowrap w-max">
        {items.map((t, i) => (
          <span key={i} className="text-xs text-cream/50 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-brand/60 inline-block" />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Notification Panel ───────────────────────────── */
function NotifPanel({ open, onClose }) {
  const notifs = [
    { icon: "✅", title: "Rescue accepted", body: "Sadadevi Foundation accepted your listing.", time: "2 min ago", unread: true },
    { icon: "⚡", title: "Pickup in 12 min", body: "Driver is on the way to Kandivali.", time: "5 min ago", unread: true },
    { icon: "💙", title: "New need near you", body: "Child Vision needs 20 school bags in Dahisar.", time: "18 min ago", unread: false },
    { icon: "🏆", title: "First rescue complete!", body: "You helped redirect 80 meals. Amazing!", time: "2 days ago", unread: false },
  ];
  return (
    <BottomSheet open={open} onClose={onClose} title="Notifications">
      <div className="space-y-2">
        {notifs.map((n, i) => (
          <div key={i} className={`flex gap-3 p-3 rounded-xl transition-colors ${n.unread ? "glass-light" : "glass"}`}>
            <div className="w-10 h-10 glass rounded-xl flex items-center justify-center text-xl flex-none">{n.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-cream">{n.title}</span>
                {n.unread && <span className="w-2 h-2 rounded-full bg-orange flex-none" />}
              </div>
              <p className="text-xs text-cream/50 mt-0.5">{n.body}</p>
              <p className="text-[10px] text-cream/30 mt-1">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}

/* ── Circular Rescue Ring ─────────────────────────── */
function RescueRing({ left, total = 240 }) {
  const pct = left == null ? 0 : Math.max(0, Math.min(1, left / total));
  const r = 54, c = 2 * Math.PI * r;
  const stroke = left == null ? "#6b7280" : left <= 0 ? "#DC2626" : left < 45 ? "#DC2626" : left < 90 ? "#D97706" : "#1A6FE0";
  return (
    <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={stroke} strokeWidth="10"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
          strokeLinecap="round" className="ring-track"
          style={{ transition: "stroke-dashoffset 1s ease, stroke 0.5s ease" }} />
      </svg>
      <div className="absolute text-center">
        <div className="text-xl font-bold text-cream countdown-digit leading-tight">
          {left == null ? "--:--" : fmtCountdown(left)}
        </div>
        <div className="text-[10px] text-cream/40 uppercase tracking-wider">remaining</div>
      </div>
    </div>
  );
}

/* ── Timeline ─────────────────────────────────────── */
function Timeline({ steps }) {
  return (
    <div className="space-y-0">
      {steps.map((s, i) => (
        <div key={i} className={`relative flex gap-3 pb-5 timeline-step ${s.done ? "done" : ""}`}>
          <div className={`flex-none w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all
            ${s.done ? "border-ok bg-ok text-white" : s.active ? "border-brand bg-brand/15" : "border-white/12 bg-white/4"}`}>
            {s.done
              ? <Icon d={icons.check} size={12} sw={3} />
              : s.active
              ? <span className="w-2 h-2 rounded-full bg-brand block" />
              : <span className="w-1.5 h-1.5 rounded-full bg-white/20 block" />}
          </div>
          <div className="pt-0.5">
            <div className={`text-sm font-medium ${s.done ? "text-cream/80" : s.active ? "text-brand-light" : "text-cream/30"}`}>
              {s.label}
            </div>
            {s.sub && <div className="text-xs text-cream/30 mt-0.5">{s.sub}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── NGO Match Card ───────────────────────────────── */
function NGOMatchCard({ n, score, reason, onAccept, rank: r }) {
  const eta = parseInt(reason) || 20;
  const isTop = r === 0;
  return (
    <div className={`relative rounded-2xl p-4 space-y-3 transition-all duration-200 glass-hover
      ${isTop ? "gradient-card-rescue glow-blue" : "glass"}`}>
      {isTop && (
        <div className="absolute -top-2.5 left-4">
          <Badge variant="brand">⭐ Best Match</Badge>
        </div>
      )}
      <div className="flex items-start justify-between gap-2 mt-1">
        <div>
          <h4 className="font-bold text-cream text-sm leading-tight">{n.name}</h4>
          <p className="text-xs text-cream/40 mt-0.5">{n.area}</p>
          <p className="text-xs text-cream/30">{n.type}</p>
        </div>
        <div className="text-right flex-none">
          <div className="text-2xl font-black text-brand-light">{score}</div>
          <div className="text-[10px] text-cream/30 uppercase tracking-wide">score</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          ["🕐", `${eta} min`, "ETA"],
          ["🍽", `${n.needToday}`, "Capacity"],
          ["🚗", n.pickup === "own" ? "Own" : n.pickup === "volunteer" ? "Vol." : "None", "Pickup"],
        ].map(([emoji, val, lbl]) => (
          <div key={lbl} className="glass rounded-xl p-2 text-center">
            <div className="text-sm">{emoji}</div>
            <div className="text-xs font-bold text-cream">{val}</div>
            <div className="text-[9px] text-cream/35 uppercase tracking-wide">{lbl}</div>
          </div>
        ))}
      </div>

      <ProgressBar value={score} color={isTop ? "bg-brand" : "bg-white/30"} />

      <div className="flex gap-2 flex-wrap">
        <Badge variant={n.food.includes("nonveg") ? "warn" : "success"}>
          {n.food.includes("nonveg") ? "Veg & Non-veg" : "Veg Only"}
        </Badge>
      </div>

      <Button variant={isTop ? "primary" : "ghost"} size="sm" className="w-full" onClick={onAccept}>
        Request Pickup →
      </Button>
    </div>
  );
}

/* ── ═══════════════════════════════════════════════ ── */
/* ──                  PAGES                          ── */
/* ── ═══════════════════════════════════════════════ ── */

/* ── HOME ────────────────────────────────────────── */
function HomePage({ setPage }) {
  const h = new Date().getHours();
  const greeting = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";

  const actions = [
    {
      id: "rescue", emoji: "⚡", label: "Rescue Food",
      desc: "Redirect surplus food before the rescue window closes.",
      cls: "gradient-card-rescue", badge: "Active",
    },
    {
      id: "needs", emoji: "💙", label: "Fulfil a Need",
      desc: "See urgent NGO requests for food, clothes, books and more.",
      cls: "gradient-card-need",
    },
    {
      id: "donate", emoji: "💰", label: "Support an NGO",
      desc: "Contribute funds or items to community organisations.",
      cls: "gradient-card-donate",
    },
  ];

  const stats = [
    { label: "Meals Rescued",   val: DEMO_IMPACT.mealsRescued,  g: "gradient-blue"   },
    { label: "Needs Fulfilled", val: DEMO_IMPACT.needsFulfilled, g: "gradient-green"  },
    { label: "NGOs Supported",  val: DEMO_IMPACT.ngosSupported,  g: "gradient-orange" },
    { label: "People Reached",  val: DEMO_IMPACT.peopleReached,  g: "bg-white/6 border border-white/8" },
  ];

  const recentActivity = [
    { icon: "🍽", text: "78 meals rescued via Sadadevi Foundation", time: "4 min ago" },
    { icon: "💙", text: "20 blankets fulfilled · Community Outreach", time: "11 min ago" },
    { icon: "✅", text: "NGO matched in 4 min · Malad area", time: "23 min ago" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Greeting hero */}
      <div className="relative rounded-3xl overflow-hidden p-6"
        style={{
          background: "linear-gradient(135deg, rgba(26,111,224,0.25) 0%, rgba(26,111,224,0.05) 60%, rgba(249,115,22,0.1) 100%)",
          border: "1px solid rgba(26,111,224,0.2)",
        }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 animate-spin-slow"
          style={{ background: "conic-gradient(from 0deg, #1A6FE0, #F97316, #1A6FE0)", filter: "blur(30px)", transform: "translate(30%, -30%)" }} />
        <div className="relative">
          <p className="text-sm text-cream/50 font-medium">{greeting} 👋</p>
          <h1 className="text-2xl font-black text-cream mt-1 leading-tight">
            How would you like<br />to help today?
          </h1>
          <p className="text-sm text-cream/40 mt-2">
            {NGOS.length} NGOs active across Mumbai
          </p>
          <div className="flex items-center gap-2 mt-3">
            <PulsingDot color="bg-ok" />
            <span className="text-xs text-ok font-medium">Live rescue network active</span>
          </div>
        </div>
      </div>

      {/* Action cards */}
      <div className="space-y-3">
        {actions.map(a => (
          <button key={a.id} onClick={() => setPage(a.id)}
            className={`w-full text-left rounded-2xl p-4 flex items-center gap-4 glass-hover group ${a.cls}`}>
            <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center text-2xl flex-none">
              {a.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-cream text-sm">{a.label}</span>
                {a.badge && <Badge variant="brand">{a.badge}</Badge>}
              </div>
              <p className="text-xs text-cream/50 mt-0.5 leading-snug">{a.desc}</p>
            </div>
            <Icon d={icons.arrow} size={16} className="text-cream/30 group-hover:text-cream/60 flex-none transition-colors" />
          </button>
        ))}
      </div>

      {/* Stats grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-cream uppercase tracking-widest">Platform Impact</h2>
          <span className="text-[10px] text-cream/25 border border-white/8 px-2 py-0.5 rounded-full">Demo data</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {stats.map(s => (
            <div key={s.label} className={`rounded-2xl p-4 ${s.g} text-white`}>
              <div className="text-2xl font-black">
                <CountUp target={s.val} />
              </div>
              <div className="text-[11px] font-medium opacity-75 mt-0.5 uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Live activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-cream uppercase tracking-widest">Live Activity</h2>
          <PulsingDot color="bg-ok" />
        </div>
        <div className="space-y-2">
          {recentActivity.map((a, i) => (
            <div key={i} className="glass rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-xl flex-none">{a.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-cream/70 leading-snug">{a.text}</p>
              </div>
              <span className="text-[10px] text-cream/30 flex-none">{a.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Critical needs alert */}
      <div className="rounded-2xl p-4 flex items-center gap-4"
        style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(249,115,22,0.05))", border: "1px solid rgba(249,115,22,0.2)" }}>
        <div className="w-10 h-10 rounded-xl gradient-orange flex items-center justify-center text-xl flex-none">🚨</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-cream">
            {NGO_NEEDS.filter(n => n.priority === "critical").length} critical needs nearby
          </div>
          <div className="text-xs text-cream/40 mt-0.5">NGOs are waiting for urgent support</div>
        </div>
        <Button variant="orange" size="sm" onClick={() => setPage("needs")}>View →</Button>
      </div>
    </div>
  );
}

/* ── RESCUE ───────────────────────────────────────── */
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

  function showToast(message, type = "success") {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(p => ({ ...p, visible: false })), 3000);
  }

  async function parse() {
    setBusy(true);
    try {
      const r = await fetch("/api/parse", { method: "POST", body: JSON.stringify({ text }) });
      const j = await r.json();
      setD(j.data); setSrc(j.source);
      showToast("Listing structured by AI ✓", "success");
    } catch {
      setD({}); setSrc("Manual entry");
      showToast("AI unavailable — fill manually", "info");
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

  const urgencyGradient = {
    medium:   "linear-gradient(135deg, rgba(26,111,224,0.25), rgba(26,111,224,0.08))",
    high:     "linear-gradient(135deg, rgba(217,119,6,0.25), rgba(217,119,6,0.08))",
    critical: "linear-gradient(135deg, rgba(220,38,38,0.3), rgba(220,38,38,0.1))",
    expired:  "linear-gradient(135deg, rgba(100,100,100,0.2), rgba(100,100,100,0.05))",
    unknown:  "linear-gradient(135deg, rgba(100,100,100,0.15), rgba(100,100,100,0.05))",
  };
  const urgencyBorder = { medium: "rgba(26,111,224,0.35)", high: "rgba(217,119,6,0.35)", critical: "rgba(220,38,38,0.45)", expired: "rgba(100,100,100,0.2)", unknown: "rgba(100,100,100,0.15)" };

  /* COMPOSE */
  if (step === "compose") return (
    <div className="space-y-6 animate-fade-in">
      <Toast {...toast} />
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">⚡</span>
          <h1 className="text-2xl font-black text-cream">Rescue Surplus Food</h1>
        </div>
        <p className="text-sm text-cream/40">Describe naturally — AI structures your listing.</p>
      </div>

      <div className="rounded-2xl p-5 space-y-4" style={{ background: "rgba(26,111,224,0.06)", border: "1px solid rgba(26,111,224,0.15)" }}>
        <Textarea id="food-msg" rows={5}
          placeholder="I have around 80 meals of rice, dal and paneer left from an event in Andheri. Prepared at 10:00 PM and pickup is possible."
          value={text} onChange={e => setText(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          {SAMPLES.map((s, i) => (
            <button key={i} onClick={() => setText(s)}
              className="rounded-xl px-3 py-1.5 text-xs text-cream/50 glass glass-hover transition-colors hover:text-brand-light">
              Sample {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl p-3 flex gap-2 items-start">
        <Icon d={icons.shield} size={14} className="text-brand-light flex-none mt-0.5" />
        <p className="text-xs text-cream/40">AI extracts only what you explicitly state. Unknown fields stay empty — never invented.</p>
      </div>

      <div className="space-y-2">
        <Button variant="orange" size="xl" className="w-full animate-pulse-glow" disabled={!text || busy} onClick={parse}>
          {busy ? (
            <span className="flex items-center gap-2">
              <Icon d={icons.spin} size={16} className="animate-spin" />
              Structuring your donation…
            </span>
          ) : "Generate Listing →"}
        </Button>
        <button onClick={() => { setD({}); setSrc("Manual"); setStep("review"); }}
          className="w-full text-xs text-cream/30 hover:text-cream/60 transition-colors py-1">
          Skip AI — fill manually
        </button>
      </div>

      <div>
        <button onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2 text-sm text-brand-light font-medium mb-3 hover:text-white transition-colors">
          <Icon d={icons.map} size={16} />
          {showMap ? "Hide" : "View"} NGO Network ({NGOS.length} NGOs)
        </button>
        {showMap && (
          <div className="rounded-2xl overflow-hidden animate-slide-up" style={{ border: "1px solid rgba(26,111,224,0.2)" }}>
            <MapView ngos={NGOS} stations={STATIONS} h={260} onPick={setMapSel} />
          </div>
        )}
        {mapSel && (
          <div className="mt-2 glass-light rounded-xl p-3 animate-slide-up flex justify-between items-start">
            <div>
              <div className="font-semibold text-sm text-cream">{mapSel.name}</div>
              <div className="text-xs text-cream/40 mt-0.5">{mapSel.area} · {mapSel.type}</div>
              <div className="flex gap-2 mt-2">
                <Badge variant={mapSel.food.includes("nonveg") ? "warn" : "success"}>
                  {mapSel.food.includes("nonveg") ? "Veg & Non-veg" : "Veg only"}
                </Badge>
              </div>
            </div>
            <button onClick={() => setMapSel(null)} className="text-cream/30 hover:text-cream transition-colors p-1">
              <Icon d={icons.close} size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  /* REVIEW */
  if (step === "review" && d) {
    const foodOpts = [
      { value: "", label: "Select type" },
      { value: "veg", label: "Vegetarian" },
      { value: "nonveg", label: "Non-vegetarian" },
    ];
    return (
      <div className="space-y-5 animate-fade-in">
        <Toast {...toast} />
        <div className="flex items-center gap-3">
          <button onClick={() => setStep("compose")}
            className="w-9 h-9 glass rounded-xl flex items-center justify-center text-cream/40 hover:text-cream transition-colors">
            <Icon d={icons.back} size={16} />
          </button>
          <div>
            <h1 className="text-xl font-black text-cream">Review Listing</h1>
            <p className="text-xs text-cream/35">{src.startsWith("AI") ? "AI extracted — verify all fields" : "Manual entry"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-cream/70">Estimated Meals</label>
            <input type="number" value={d.meals ?? ""} onChange={e => setF("meals", e.target.value ? +e.target.value : "")}
              placeholder="e.g. 80"
              className={`w-full rounded-xl input-dark px-4 py-3 text-sm ${!d.meals ? "border-warn/40" : ""}`} />
            {!d.meals && <p className="text-xs text-amber-400">Required</p>}
          </div>
          <Select id="food-type" label="Food Type" options={foodOpts}
            value={d.food_type ?? ""} onChange={e => setF("food_type", e.target.value)}
            error={!d.food_type ? "Required" : ""} />
          <Input id="prep" label="Prepared At" type="time"
            value={d.prepared_at ?? ""} onChange={e => setF("prepared_at", e.target.value)}
            error={!d.prepared_at ? "Required" : ""} />
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
          <div className="rounded-xl px-4 py-3 text-sm text-amber-400 flex gap-2"
            style={{ background: "rgba(217,119,6,0.1)", border: "1px solid rgba(217,119,6,0.25)" }}>
            <span>⚠</span>
            <span>Required: <strong>{a.missing.join(", ")}</strong></span>
          </div>
        )}
        {a?.conflicts.map(c => (
          <div key={c} className="rounded-xl px-4 py-3 text-sm text-red-400 flex gap-2"
            style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.25)" }}>
            <span>✖</span> <span>{c}</span>
          </div>
        ))}

        {/* Safety block */}
        <div className="glass rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Icon d={icons.shield} size={16} className="text-brand-light" />
            <h3 className="text-sm font-bold text-cream">Safety Information</h3>
          </div>
          <div className="space-y-2">
            {[
              ["Preparation time", d.prepared_at],
              ["Packing / holding", d.packed_at],
              ["Food type", d.food_type],
              ["Temperature", d.temperature_c != null ? `${d.temperature_c}°C` : null],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
                <span className="text-xs text-cream/40">{k}</span>
                <span className={`text-xs font-semibold ${v ? "text-cream/80" : "text-cream/25"}`}>{v || "Not provided"}</span>
              </div>
            ))}
          </div>
          <div className={`rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-2
            ${canPub ? "text-emerald-400 bg-ok/10 border border-ok/20" : "text-amber-400 bg-warn/10 border border-warn/20"}`}>
            {canPub ? "✓ Safety information complete" : "⚠ Additional information required"}
          </div>
          <p className="text-[10px] text-cream/25">Rescue window is a platform rule (4 hrs from prep) — not a food safety certificate.</p>
        </div>

        <Button variant="orange" size="xl" className="w-full" disabled={!canPub}
          onClick={() => { setPub(d); setStep("live"); showToast("Listing published! Finding NGOs…"); }}>
          Publish & Match NGOs →
        </Button>
      </div>
    );
  }

  /* LIVE */
  if (step === "live" && pub) {
    const tlSteps = pick ? [
      { label: "Listing Created",    done: true },
      { label: "Safety Reviewed",    done: true },
      { label: "NGO Matched",        done: true },
      { label: "NGO Accepted",       done: true },
      { label: "Pickup In Progress", done: confirmed, active: !confirmed },
      { label: "Handover Complete",  done: confirmed },
    ] : [
      { label: "Listing Created",         done: true },
      { label: "Safety Reviewed",         done: true },
      { label: "Matching Started",        done: true },
      { label: "NGO Acceptance Pending",  done: false, active: true },
      { label: "Pickup",                  done: false },
      { label: "Handover",                done: false },
    ];

    return (
      <div className="space-y-5 animate-fade-in">
        <Toast {...toast} />

        {/* Rescue window ring */}
        <div className="rounded-3xl p-5 flex items-center gap-5"
          style={{ background: urgencyGradient[live.urgency] || urgencyGradient.unknown, border: `1px solid ${urgencyBorder[live.urgency] || urgencyBorder.unknown}` }}>
          <RescueRing left={live.left} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <UrgencyBadge urgency={live.urgency} />
              {!pick && !confirmed && <PulsingDot color="bg-orange" />}
            </div>
            <div className="text-lg font-black text-cream leading-tight">{pub.meals} meals</div>
            <div className="text-sm text-cream/50 mt-0.5 capitalize">{pub.food_type} · {pub.location}</div>
            {live.left != null && live.left > 0 && (
              <div className="mt-3">
                <ProgressBar value={Math.max(0, (live.left / (4 * 60)) * 100)} color="bg-white/40" />
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="glass rounded-2xl p-4">
          <h3 className="text-xs font-bold text-cream/50 uppercase tracking-widest mb-3">Rescue Progress</h3>
          <Timeline steps={tlSteps} />
        </div>

        {/* Map */}
        {!pick && m && (
          <div className="rounded-2xl overflow-hidden animate-slide-up" style={{ border: "1px solid rgba(26,111,224,0.2)" }}>
            <MapView ngos={NGOS} stations={STATIONS}
              donor={COORD[zoneKey(pub.location)]}
              hi={m.ranked.slice(0, 3).map(r => r.n.id)} h={220} onPick={setMapSel} />
          </div>
        )}

        {/* States */}
        {live.left <= 0 ? (
          <div className="glass rounded-2xl p-5 space-y-2" style={{ border: "1px solid rgba(220,38,38,0.3)" }}>
            <div className="text-red-400 font-bold text-base">Rescue Window Expired</div>
            <p className="text-sm text-cream/40">Human food matching has ended. Contact animal feed or composting partners for this batch.</p>
          </div>
        ) : confirmed ? (
          <div className="flex flex-col items-center py-12 space-y-4 animate-slide-up">
            <div className="w-20 h-20 rounded-3xl gradient-green flex items-center justify-center text-white text-4xl glow-green">✓</div>
            <h2 className="text-2xl font-black text-cream">Rescue Completed!</h2>
            <p className="text-sm text-cream/50 text-center">{pub.meals} meals redirected to <strong className="text-cream">{pick.n.name}</strong></p>
            <div className="glass rounded-2xl p-4 w-full space-y-2 text-sm">
              {[["NGO", pick.n.name], ["Meals rescued", pub.meals], ["Type", pub.food_type]].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center border-b border-white/6 last:border-0 py-1.5">
                  <span className="text-cream/40">{k}</span>
                  <span className="font-bold text-cream capitalize">{v}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-cream/30 text-center">Your contribution has been added to your impact profile.</p>
            <Button variant="primary" size="lg" onClick={reset}>Start New Rescue</Button>
          </div>
        ) : pick ? (
          /* OTP Handover */
          <div className="space-y-4">
            <h2 className="font-black text-cream text-lg">Handover</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Donor panel */}
              <div className="glass-light rounded-2xl p-5 space-y-4">
                <div className="text-xs text-cream/40 font-semibold uppercase tracking-widest">Donor Screen</div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 gradient-blue rounded-xl flex items-center justify-center text-white">
                    <Icon d={icons.user} size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-cream">{pick.n.name} accepted</div>
                    <div className="text-xs text-cream/40">Pickup estimated in ~15 min</div>
                  </div>
                </div>
                <div className="text-center py-4">
                  <div className="text-xs text-cream/30 uppercase tracking-widest mb-2">Handover Code</div>
                  <div className="text-6xl font-black tracking-[0.2em] text-brand-light countdown-digit">{otp}</div>
                  <p className="text-xs text-cream/30 mt-3 max-w-[180px] mx-auto">Share only on physical handover</p>
                </div>
                <div className="rounded-xl px-3 py-2 text-xs font-semibold text-emerald-400 flex gap-2 items-center"
                  style={{ background: "rgba(16,163,74,0.1)", border: "1px solid rgba(16,163,74,0.2)" }}>
                  <PulsingDot color="bg-ok" /> Pickup in progress
                </div>
              </div>

              {/* NGO panel */}
              <div className="glass-light rounded-2xl p-5 space-y-4">
                <div className="text-xs text-cream/40 font-semibold uppercase tracking-widest">NGO Screen</div>
                {ngoInp === "ok" ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-3 animate-slide-up">
                    <div className="w-16 h-16 gradient-green rounded-2xl flex items-center justify-center text-white text-3xl">✓</div>
                    <p className="font-bold text-emerald-400">Delivered!</p>
                    <p className="text-sm text-cream/50">{pub.meals} meals rescued</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 gradient-orange rounded-xl flex items-center justify-center text-white">
                        <Icon d={icons.ngo} size={18} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-cream">Confirm Handover</div>
                        <div className="text-xs text-cream/40">Enter the donor's code</div>
                      </div>
                    </div>
                    <Input id="otp-field" label="Handover Code" placeholder="Enter 4-digit code"
                      value={ngoInp} onChange={e => setNgoInp(e.target.value)}
                      className="text-center text-2xl tracking-[0.3em] font-black" />
                    <Button variant="success" size="lg" className="w-full"
                      onClick={() => { if (ngoInp === otp) { setNgoInp("ok"); setConfirmed(true); showToast("Rescue completed! 🎉", "success"); } else showToast("Incorrect code", "error"); }}
                      disabled={ngoInp.length < 4}>
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
              <h2 className="font-black text-cream text-lg">Best Matches</h2>
              <span className="text-xs text-cream/30">{m.ranked.length} eligible</span>
            </div>
            <div className="space-y-3">
              {m.ranked.slice(0, 3).map(({ n, score, reason }, i) => (
                <NGOMatchCard key={n.id} n={n} score={score} reason={reason} rank={i}
                  onAccept={() => { setPick({ n }); setOtp(String(1000 + Math.floor(Math.random() * 9000))); showToast(`${n.name} will pick up in ~${parseInt(reason)} min`); }} />
              ))}
            </div>
            {m.rejected.length > 0 && (
              <button onClick={() => setRejSheet(true)} className="text-xs text-cream/30 underline hover:text-cream/60 transition-colors">
                Why were {m.rejected.length} NGO{m.rejected.length > 1 ? "s" : ""} excluded?
              </button>
            )}
            <BottomSheet open={rejSheet} onClose={() => setRejSheet(false)} title="Excluded NGOs">
              <div className="space-y-3">
                {m.rejected.map(({ n, why }) => (
                  <div key={n.id} className="glass rounded-xl p-3">
                    <div className="text-sm font-semibold text-cream">{n.name}</div>
                    <div className="text-xs text-cream/40 mt-1">{why.join(" · ")}</div>
                  </div>
                ))}
              </div>
            </BottomSheet>
          </div>
        )}

        <button onClick={reset} className="text-xs text-cream/25 hover:text-cream/50 transition-colors">
          ← Start a new listing
        </button>
      </div>
    );
  }

  return null;
}

/* ── NEEDS ────────────────────────────────────────── */
function NeedsPage() {
  const [tab, setTab] = useState("needs");
  const [helped, setHelped] = useState({});
  const [toast, setToast] = useState({ visible: false, message: "" });

  function markHelp(id) {
    setHelped(p => ({ ...p, [id]: true }));
    setToast({ visible: true, message: "Marked! A coordinator will be in touch. 🙏" });
    setTimeout(() => setToast(p => ({ ...p, visible: false })), 3000);
  }

  const priorityGrad = {
    critical: { bg: "rgba(220,38,38,0.12)", border: "rgba(220,38,38,0.3)", badge: "critical" },
    high:     { bg: "rgba(217,119,6,0.1)",  border: "rgba(217,119,6,0.25)", badge: "warn" },
    medium:   { bg: "rgba(26,111,224,0.08)", border: "rgba(26,111,224,0.2)", badge: "brand" },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Toast {...toast} />
      <div>
        <h1 className="text-2xl font-black text-cream">Community Needs</h1>
        <p className="text-sm text-cream/40 mt-1">What local NGOs need right now.</p>
      </div>

      <Tabs
        tabs={[{ id: "needs", label: "Current Needs" }, { id: "categories", label: "By Category" }]}
        active={tab} onChange={setTab} />

      {tab === "needs" && (
        <div className="space-y-3">
          {NGO_NEEDS.map(n => {
            const p = priorityGrad[n.priority] || priorityGrad.medium;
            return (
              <div key={n.id} className="rounded-2xl p-4 space-y-3 glass-hover"
                style={{ background: p.bg, border: `1px solid ${p.border}` }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-cream text-base">{n.qty} {n.item}</span>
                      <Badge variant={p.badge}>{n.priority}</Badge>
                    </div>
                    <p className="text-xs text-cream/50 mt-1">{n.ngoName}</p>
                    <p className="text-xs text-cream/30">{n.category} · {n.area}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-cream/30 flex items-center gap-1">
                    <Icon d={icons.clock} size={12} className="text-cream/30" />
                    Needed by {n.deadline}
                  </span>
                  {helped[n.id] ? (
                    <Badge variant="success">✓ You're helping</Badge>
                  ) : (
                    <Button variant="subtle" size="sm" onClick={() => markHelp(n.id)}>
                      I Can Help
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "categories" && (
        <div className="space-y-3">
          <p className="text-sm text-cream/40">Choose a category to see matching NGOs near you.</p>
          <div className="grid grid-cols-2 gap-3">
            {ITEM_CATEGORIES.map(cat => (
              <div key={cat.id} className="glass glass-hover rounded-2xl p-4 cursor-pointer">
                <div className="text-3xl mb-2">{cat.icon}</div>
                <div className="text-sm font-bold text-cream">{cat.label}</div>
                <div className={`text-xs mt-0.5 ${cat.count > 0 ? "text-brand-light" : "text-cream/25"}`}>
                  {cat.count > 0 ? `${cat.count} NGOs need this` : "No requests"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── DONATE ───────────────────────────────────────── */
function DonatePage() {
  const [donated, setDonated] = useState(null);
  const AMOUNTS = [100, 250, 500, 1000];

  if (donated) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-5 animate-slide-up">
      <div className="w-24 h-24 gradient-green rounded-3xl flex items-center justify-center text-white text-5xl glow-green">✓</div>
      <div className="text-center">
        <h2 className="text-2xl font-black text-cream">Thank You!</h2>
        <p className="text-sm text-cream/50 mt-2">
          <strong className="text-cream">₹{donated.amount}</strong> → <strong className="text-cream">{donated.ngo}</strong>
        </p>
        <Badge variant="warn" className="mt-3">Demo — No real payment processed</Badge>
      </div>
      <Button variant="ghost" onClick={() => setDonated(null)}>Donate to Another NGO</Button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black text-cream">Support an NGO</h1>
        <p className="text-sm text-cream/40 mt-1">Contribute funds to community organizations.</p>
      </div>

      <div className="glass rounded-xl px-4 py-3 flex gap-2 items-center text-xs text-amber-400"
        style={{ border: "1px solid rgba(217,119,6,0.25)" }}>
        <span>ℹ️</span>
        <span>Demo mode — no real payment processed. Illustrative only.</span>
      </div>

      <div className="space-y-4">
        {NGOS.slice(0, 5).map(n => {
          const raised = ((n.id * 13000) % 40000) + 10000;
          const goal = 60000;
          const pct = Math.round((raised / goal) * 100);
          return (
            <div key={n.id} className="glass glass-hover rounded-2xl p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-cream">{n.name}</div>
                  <div className="text-xs text-cream/40 mt-0.5">{n.area} · {n.type}</div>
                </div>
                <Badge variant={n.food.includes("nonveg") ? "warn" : "success"}>
                  {n.food.includes("nonveg") ? "Veg & Non-veg" : "Veg"}
                </Badge>
              </div>
              <div>
                <div className="flex justify-between text-xs text-cream/40 mb-1.5">
                  <span>₹{raised.toLocaleString("en-IN")} raised</span>
                  <span>{pct}% of ₹{goal.toLocaleString("en-IN")}</span>
                </div>
                <ProgressBar value={pct} color="bg-ok" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {AMOUNTS.map(a => (
                  <Button key={a} variant="ghost" size="sm" onClick={() => setDonated({ ngo: n.name, amount: a })}>
                    ₹{a}
                  </Button>
                ))}
                <Button variant="subtle" size="sm" onClick={() => setDonated({ ngo: n.name, amount: 2000 })}>
                  Custom
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── IMPACT ───────────────────────────────────────── */
function ImpactPage() {
  const stats = [
    { label: "Meals Supported",  val: DEMO_USER.mealsSupported,  icon: "🍽️", g: "gradient-blue",   suffix: "" },
    { label: "Needs Fulfilled",  val: DEMO_USER.needsFulfilled,  icon: "✅", g: "gradient-green",  suffix: "" },
    { label: "Items Donated",    val: DEMO_USER.itemsDonated,    icon: "📦", g: "gradient-orange", suffix: "" },
    { label: "Contributed",      val: DEMO_USER.contributed,     icon: "💰", g: "bg-white/6 border border-white/8", prefix: "₹", suffix: "" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="rounded-3xl p-6"
        style={{ background: "linear-gradient(135deg, rgba(16,163,74,0.2), rgba(16,163,74,0.05))", border: "1px solid rgba(16,163,74,0.2)" }}>
        <div className="text-sm text-cream/50 font-medium">Your SAHYOG Impact</div>
        <div className="text-3xl font-black text-cream mt-1">Tushar Salunkhe</div>
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="success">⭐ Active Contributor</Badge>
          <Badge variant="brand">🍽 Food Rescuer</Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map(s => (
          <div key={s.label} className={`rounded-2xl p-4 text-white ${s.g}`}>
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-2xl font-black">
              <CountUp target={s.val} prefix={s.prefix || ""} suffix={s.suffix} />
            </div>
            <div className="text-[11px] font-semibold opacity-70 mt-0.5 uppercase tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>

      {/* History */}
      <div>
        <h2 className="text-sm font-bold text-cream/50 uppercase tracking-widest mb-3">Contribution History</h2>
        <div className="space-y-2">
          {CONTRIBUTION_HISTORY.map(c => (
            <div key={c.id} className="glass glass-hover rounded-xl px-4 py-3 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base flex-none
                ${c.type === "Food Rescue" ? "gradient-blue" : c.type === "Donation" ? "gradient-green" : "gradient-orange"}`}>
                {c.type === "Food Rescue" ? "🥘" : c.type === "Donation" ? "💰" : "📦"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-cream truncate">{c.ngo}</div>
                <div className="text-xs text-cream/35">{c.date} · {c.type}</div>
              </div>
              <div className="text-right flex-none">
                <Badge variant="success">{c.status}</Badge>
                <div className="text-xs text-cream/30 mt-1">
                  {c.meals ? `${c.meals} meals` : c.amount ? `₹${c.amount}` : c.item}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Impact Day */}
      <div className="rounded-3xl p-6 space-y-4"
        style={{ background: "linear-gradient(135deg, rgba(26,111,224,0.25) 0%, rgba(249,115,22,0.15) 100%)", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div>
          <div className="text-xs text-cream/50 font-bold uppercase tracking-widest">Annual Recognition</div>
          <div className="text-xl font-black text-cream mt-1">2026 SAHYOG Impact Day 🏆</div>
          <p className="text-sm text-cream/50 mt-2">
            A celebration of everyone who created measurable impact this year. Download your personalised certificate.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm glass rounded-xl p-3">
          {[["Meals rescued", "4,850"], ["Needs fulfilled", "28"], ["Contributed", "₹32,500"], ["Items donated", "140"]].map(([k, v]) => (
            <div key={k} className="text-center py-1">
              <div className="font-black text-cream">{v}</div>
              <div className="text-[10px] text-cream/35">{k}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">View Report</Button>
          <Button variant="primary" size="sm">Download Certificate</Button>
        </div>
      </div>
    </div>
  );
}

/* ── ═══════════════════════════════════════════════ ── */
/* ──                NAVIGATION                       ── */
/* ── ═══════════════════════════════════════════════ ── */

const NAV_ITEMS = [
  { id: "home",   label: "Home",    d: icons.home   },
  { id: "rescue", label: "Rescue",  d: icons.rescue, highlight: true },
  { id: "needs",  label: "Needs",   d: icons.needs  },
  { id: "donate", label: "Donate",  d: icons.donate },
  { id: "impact", label: "Impact",  d: icons.impact },
];

function Sidebar({ active, setActive, onNotif }) {
  return (
    <aside className="hidden lg:flex flex-col w-60 xl:w-64 min-h-screen sidebar sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/6">
        <img src="/logo.png" alt="SAHYOG" className="h-9 w-auto" />
        <div>
          <div className="font-black text-cream text-sm leading-tight">SAHYOG</div>
          <div className="text-[9px] text-cream/30 leading-tight font-medium">Connecting Needs. Creating Impact.</div>
        </div>
      </div>

      {/* Status bar */}
      <div className="px-4 py-3 border-b border-white/6">
        <div className="flex items-center gap-2 text-xs text-cream/40">
          <PulsingDot color="bg-ok" />
          <span>Live network · {NGOS.length} NGOs active</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => setActive(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150
              ${active === item.id
                ? "bg-brand/15 text-brand-light border border-brand/20"
                : "text-cream/40 hover:text-cream/70 hover:bg-white/4"}`}>
            <Icon d={item.d} size={18} sw={active === item.id ? 2 : 1.6}
              className={active === item.id ? "text-brand-light" : "text-cream/30"} />
            {item.label}
            {item.id === "rescue" && active !== "rescue" && (
              <span className="ml-auto flex items-center">
                <PulsingDot color="bg-orange" />
              </span>
            )}
            {item.id === "needs" && active !== "needs" && (
              <span className="ml-auto text-[10px] font-bold text-orange bg-orange/15 px-1.5 py-0.5 rounded-full">
                {NGO_NEEDS.filter(n => n.priority === "critical").length}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Notif button */}
      <div className="px-4 pb-4 border-t border-white/6 pt-3">
        <button onClick={onNotif}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-cream/40 hover:text-cream/70 hover:bg-white/4 transition-all relative notif-dot">
          <Icon d={icons.bell} size={18} className="text-cream/30" />
          Notifications
        </button>
        <div className="mt-3 px-1">
          <div className="text-[10px] text-cream/20">Mumbai NGO Network · Demo data only</div>
        </div>
      </div>
    </aside>
  );
}

function BottomNav({ active, setActive, onNotif }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bottom-nav safe-bottom">
      <div className="flex">
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => setActive(item.id)}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-all relative
              ${active === item.id ? "text-brand-light" : "text-cream/25 hover:text-cream/50"}`}>
            {item.highlight ? (
              <>
                <div className={`absolute -top-4 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all
                  ${active === item.id ? "gradient-blue glow-blue" : "gradient-orange"}`}>
                  <Icon d={item.d} size={20} className="text-white" sw={2} />
                </div>
                <span className="text-[10px] font-bold mt-4">{item.label}</span>
              </>
            ) : (
              <>
                <Icon d={item.d} size={20} sw={active === item.id ? 2 : 1.6} />
                <span className="text-[10px] font-semibold">{item.label}</span>
                {item.id === "needs" && (
                  <span className="absolute top-1.5 right-1/4 w-4 h-4 text-[9px] font-black bg-orange text-white rounded-full flex items-center justify-center">
                    {NGO_NEEDS.filter(n => n.priority === "critical").length}
                  </span>
                )}
              </>
            )}
          </button>
        ))}
        {/* Notif */}
        <button onClick={onNotif}
          className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-cream/25 hover:text-cream/50 relative notif-dot">
          <Icon d={icons.bell} size={20} sw={1.6} />
          <span className="text-[10px] font-semibold">Alerts</span>
        </button>
      </div>
    </nav>
  );
}

/* ── Mobile top header ────────────────────────────── */
function MobileHeader({ onNotif }) {
  return (
    <header className="lg:hidden sticky top-0 z-30"
      style={{ background: "rgba(5,17,31,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="SAHYOG" className="h-8 w-auto" />
          <div>
            <div className="text-sm font-black text-cream leading-tight">SAHYOG</div>
            <div className="text-[9px] text-cream/30 leading-tight">Connecting Needs. Creating Impact.</div>
          </div>
        </div>
        <button onClick={onNotif} className="relative w-9 h-9 glass rounded-xl flex items-center justify-center text-cream/50 hover:text-cream transition-colors notif-dot">
          <Icon d={icons.bell} size={18} />
        </button>
      </div>
      <LiveTicker />
    </header>
  );
}

/* ── ROOT ─────────────────────────────────────────── */
export default function App() {
  const [page, setPage] = useState("home");
  const [notifOpen, setNotifOpen] = useState(false);

  const pages = {
    home:   <HomePage setPage={setPage} />,
    rescue: <RescuePage />,
    needs:  <NeedsPage />,
    donate: <DonatePage />,
    impact: <ImpactPage />,
  };

  return (
    <div className="flex min-h-screen gradient-hero">
      <Sidebar active={page} setActive={setPage} onNotif={() => setNotifOpen(true)} />

      <main className="flex-1 min-w-0 pb-28 lg:pb-0">
        <MobileHeader onNotif={() => setNotifOpen(true)} />

        {/* Desktop ticker */}
        <div className="hidden lg:block sticky top-0 z-20"
          style={{ background: "rgba(5,17,31,0.8)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <LiveTicker />
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 lg:px-8 lg:py-8">
          {pages[page] || pages.home}
        </div>
      </main>

      <BottomNav active={page} setActive={setPage} onNotif={() => setNotifOpen(true)} />
      <NotifPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
    </div>
  );
}
