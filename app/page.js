"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { NGOS, STATIONS, COORD } from "@/lib/ngos";
import { analyze, rank, zoneKey } from "@/lib/rules";
import { DEMO_IMPACT, DEMO_USER, NGO_NEEDS, CONTRIBUTION_HISTORY, ITEM_CATEGORIES, PRIORITY_COLOR } from "@/lib/demo";
import {
  Button, Badge, Card, StatCard, Input, Select, Textarea,
  ProgressBar, EmptyState, UrgencyBadge, BottomSheet, Tabs, Skeleton,
} from "@/components/ui";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

/* ── helpers ─────────────────────────────────────── */
const nowMin = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };
const fmtCountdown = x => {
  const s = Math.max(0, Math.round(x * 60));
  return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60]
    .map(v => String(v).padStart(2, "0")).join(":");
};
const SAMPLES = [
  "80 plates rice dal paneer left from a wedding in Kandivali. Veg. Cooked around 10 PM, packed 11:10 PM. Pickup ASAP.",
  "About 60 vegetarian meals from a catering event in Thakur Village. Cooked 9 PM, packed around 8 PM.",
  "150 plates non-veg biryani in Charkop, cooked at 11 PM tonight.",
  "Some food left from a family function in Malad. Around 40 plates veg, cooked 7 PM.",
];

/* ── Sidebar nav (desktop) ──────────────────────── */
const NAV = [
  { id: "home",    label: "Home",         icon: <HomeIcon /> },
  { id: "rescue",  label: "Food Rescue",  icon: <RescueIcon /> },
  { id: "needs",   label: "Community Needs", icon: <NeedsIcon /> },
  { id: "donate",  label: "Donate",       icon: <DonateIcon /> },
  { id: "impact",  label: "Impact",       icon: <ImpactIcon /> },
];

/* ── Icons (inline SVG) ─────────────────────────── */
function HomeIcon()   { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 12L12 3l9 9M5 10v10h4v-6h6v6h4V10"/></svg>; }
function RescueIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>; }
function NeedsIcon()  { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>; }
function DonateIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>; }
function ImpactIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>; }
function CheckIcon()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>; }
function ClockIcon()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }

/* ── CountUp ────────────────────────────────────── */
function CountUp({ target, duration = 1200, suffix = "" }) {
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
          setVal(Math.floor(p * target));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{val.toLocaleString("en-IN")}{suffix}</span>;
}

/* ── Timeline ────────────────────────────────────── */
function Timeline({ steps }) {
  return (
    <div className="space-y-0">
      {steps.map((s, i) => (
        <div key={i} className={`relative flex gap-3 pb-5 timeline-step ${s.done ? "done" : ""}`}>
          <div className={`flex-none w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5
            ${s.done ? "border-ok bg-ok text-white" : s.active ? "border-brand bg-white" : "border-border bg-white"}`}>
            {s.done ? <CheckIcon /> : s.active
              ? <span className="w-2 h-2 rounded-full bg-brand block" />
              : <span className="w-2 h-2 rounded-full bg-border block" />}
          </div>
          <div>
            <div className={`text-sm font-medium ${s.done ? "text-navy" : s.active ? "text-brand" : "text-muted"}`}>{s.label}</div>
            {s.sub && <div className="text-xs text-muted mt-0.5">{s.sub}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── NGO card in matching ────────────────────────── */
function NGOMatchCard({ n, score, reason, onAccept }) {
  const eta = parseInt(reason);
  return (
    <Card className="space-y-3 animate-slide-up">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-semibold text-navy text-sm">{n.name}</h4>
          <p className="text-xs text-muted mt-0.5">{n.area} · {n.type}</p>
        </div>
        <div className="text-right flex-none">
          <div className="text-lg font-bold text-brand">{score}</div>
          <div className="text-xs text-muted">match</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-cream rounded-lg p-2.5 space-y-0.5">
          <div className="text-muted">Estimated pickup</div>
          <div className="font-semibold text-navy flex items-center gap-1"><ClockIcon />{eta} min</div>
        </div>
        <div className="bg-cream rounded-lg p-2.5 space-y-0.5">
          <div className="text-muted">Daily capacity</div>
          <div className="font-semibold text-navy">{n.needToday} meals</div>
        </div>
      </div>
      <ProgressBar value={score} />
      <div className="flex gap-2">
        <div className={`text-xs px-2 py-1 rounded-md font-medium ${n.food.includes("nonveg") ? "bg-orange/10 text-orange" : "bg-ok/10 text-ok"}`}>
          {n.food.includes("nonveg") ? "Veg & Non-veg" : "Veg only"}
        </div>
        <div className={`text-xs px-2 py-1 rounded-md font-medium bg-brand/10 text-brand`}>
          Pickup: {n.pickup === "own" ? "Own vehicle" : n.pickup === "volunteer" ? "Volunteer" : "Not available"}
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button variant="orange" size="sm" className="flex-1" onClick={onAccept}>
          Request Pickup
        </Button>
      </div>
    </Card>
  );
}

/* ── OTP Handover ────────────────────────────────── */
function HandoverPanel({ pub, pick, otp, ngoOtpInput, setNgoOtpInput, onConfirm, confirmed }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Donor side */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-brand">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg>
          </div>
          <div>
            <div className="text-xs text-muted">Donor Screen</div>
            <div className="text-sm font-semibold text-navy">{pick.n.name} accepted</div>
          </div>
        </div>
        <div className="text-center py-4">
          <div className="text-xs text-muted mb-2 uppercase tracking-wider">Handover Code</div>
          <div className="text-5xl font-bold tracking-widest text-brand countdown-digit">{otp}</div>
          <p className="text-xs text-muted mt-3 max-w-[200px] mx-auto">Share this code only when the food is physically handed over.</p>
        </div>
        <div className="bg-ok/5 border border-ok/20 rounded-xl p-3 text-sm text-ok">
          ✓ Pickup estimated in ~15 min
        </div>
      </Card>

      {/* NGO side */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange/10 flex items-center justify-center text-orange">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <div className="text-xs text-muted">NGO Screen</div>
            <div className="text-sm font-semibold text-navy">Confirm Handover</div>
          </div>
        </div>
        {confirmed ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-2 animate-slide-up">
            <div className="w-14 h-14 rounded-full bg-ok flex items-center justify-center text-white text-2xl">✓</div>
            <p className="font-semibold text-ok">Rescue Completed!</p>
            <p className="text-sm text-muted">{pub.meals} meals successfully redirected.</p>
          </div>
        ) : (
          <>
            <Input id="otp-input" label="Enter Handover Code" placeholder="4-digit code"
              value={ngoOtpInput} onChange={e => setNgoOtpInput(e.target.value)}
              className="text-center text-2xl tracking-widest font-bold" />
            <Button variant="success" size="lg" className="w-full" onClick={onConfirm}
              disabled={ngoOtpInput.length < 4}>
              Confirm Handover
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}

/* ── Needs Feed ──────────────────────────────────── */
function NeedsPage() {
  const [activeTab, setActiveTab] = useState("needs");
  const [helped, setHelped] = useState({});
  const [showThanks, setShowThanks] = useState(null);

  function handleHelp(id) {
    setHelped(p => ({ ...p, [id]: true }));
    setShowThanks(id);
    setTimeout(() => setShowThanks(null), 2500);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-navy">Community Needs</h1>
        <p className="text-sm text-muted mt-1">See what local NGOs need right now.</p>
      </div>

      <Tabs
        tabs={[{ id: "needs", label: "Current Needs" }, { id: "categories", label: "Donate Items" }]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "needs" && (
        <div className="space-y-3">
          {NGO_NEEDS.map(need => (
            <Card key={need.id} className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-navy text-sm">{need.qty} {need.item}</span>
                    <Badge variant={PRIORITY_COLOR[need.priority] || "default"}>{need.priority}</Badge>
                  </div>
                  <p className="text-xs text-muted mt-0.5">{need.ngoName} · {need.area}</p>
                </div>
                <span className="text-xs text-muted flex-none">{need.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted flex items-center gap-1">
                  <ClockIcon /> Needed by {need.deadline}
                </span>
                {helped[need.id] ? (
                  <Badge variant="success">✓ Marked to Help</Badge>
                ) : (
                  <Button variant="brand" size="sm" onClick={() => handleHelp(need.id)}>
                    I Can Help
                  </Button>
                )}
              </div>
              {showThanks === need.id && (
                <div className="text-xs text-ok animate-slide-up">
                  ✓ Thank you! A coordinator will reach out via the NGO to arrange the handover.
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {activeTab === "categories" && (
        <div className="space-y-3">
          <p className="text-sm text-muted">Choose a category to see which NGOs need it near you.</p>
          <div className="grid grid-cols-2 gap-3">
            {ITEM_CATEGORIES.map(cat => (
              <Card key={cat.id} hover className="flex items-center gap-3 p-3">
                <span className="text-2xl">{cat.icon}</span>
                <div>
                  <div className="text-sm font-semibold text-navy">{cat.label}</div>
                  {cat.count > 0
                    ? <div className="text-xs text-brand">{cat.count} NGOs need this</div>
                    : <div className="text-xs text-muted">No current requests</div>}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Donate Page ─────────────────────────────────── */
function DonatePage() {
  const [amount, setAmount] = useState("");
  const [custom, setCustom] = useState(false);
  const [donated, setDonated] = useState(null);
  const AMOUNTS = [100, 250, 500, 1000];

  function handleDonate(ngoName, a) {
    setDonated({ ngoName, amount: a });
  }

  if (donated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 animate-slide-up">
        <div className="w-20 h-20 rounded-full bg-ok flex items-center justify-center text-white text-3xl">✓</div>
        <h2 className="text-xl font-bold text-navy">Thank You!</h2>
        <p className="text-sm text-muted text-center max-w-xs">
          Your contribution of <strong>₹{donated.amount}</strong> to <strong>{donated.ngoName}</strong> has been registered.
          <br /><span className="text-xs mt-1 block text-orange">Demo: No real payment was processed.</span>
        </p>
        <Button variant="ghost" onClick={() => setDonated(null)}>Donate to Another NGO</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-navy">Support an NGO</h1>
        <p className="text-sm text-muted mt-1">Contribute funds to organizations doing real work.</p>
      </div>
      <div className="bg-orange/8 border border-orange/20 rounded-xl p-3 text-sm text-orange">
        ℹ️ Demo mode — no real payment is processed. This simulates the donation flow.
      </div>
      <div className="space-y-3">
        {NGOS.slice(0, 5).map(n => (
          <Card key={n.id} className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold text-navy text-sm">{n.name}</div>
                <div className="text-xs text-muted mt-0.5">{n.area} · {n.type}</div>
              </div>
              <Badge variant="brand">{n.food.includes("nonveg") ? "Veg & Non-veg" : "Veg"}</Badge>
            </div>
            <ProgressBar value={60 + (n.id * 7) % 30} color="bg-ok" />
            <div className="flex items-center justify-between text-xs text-muted">
              <span>₹{((n.id * 13000) % 40000 + 10000).toLocaleString("en-IN")} raised</span>
              <span>Goal: ₹60,000</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {AMOUNTS.map(a => (
                <Button key={a} variant="ghost" size="sm" onClick={() => handleDonate(n.name, a)}>₹{a}</Button>
              ))}
              <Button variant="subtle" size="sm" onClick={() => handleDonate(n.name, 2000)}>Custom</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ── Impact Page ──────────────────────────────────── */
function ImpactPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-navy">Your SAHYOG Impact</h1>
        <p className="text-sm text-muted mt-1">Everything you have contributed, tracked.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Meals Supported"    value={<CountUp target={DEMO_USER.mealsSupported} />}  icon="🍽️" color="text-brand" />
        <StatCard label="Needs Fulfilled"    value={<CountUp target={DEMO_USER.needsFulfilled} />}  icon="✅" color="text-ok" />
        <StatCard label="Contributed"        value={`₹${DEMO_USER.contributed.toLocaleString("en-IN")}`} icon="💰" color="text-orange" />
        <StatCard label="Items Donated"      value={<CountUp target={DEMO_USER.itemsDonated} />}    icon="📦" color="text-navy" />
      </div>

      <div>
        <h2 className="text-base font-semibold text-navy mb-3">Contribution History</h2>
        <div className="space-y-3">
          {CONTRIBUTION_HISTORY.map(c => (
            <Card key={c.id} className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-none
                ${c.type === "Food Rescue" ? "bg-brand/10" : c.type === "Donation" ? "bg-ok/10" : "bg-orange/10"}`}>
                {c.type === "Food Rescue" ? "🥘" : c.type === "Donation" ? "💰" : "📦"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-navy truncate">{c.ngo}</div>
                <div className="text-xs text-muted">{c.date} · {c.type}</div>
              </div>
              <div className="text-right flex-none">
                <Badge variant="success">{c.status}</Badge>
                <div className="text-xs text-muted mt-1">
                  {c.meals ? `${c.meals} meals` : c.amount ? `₹${c.amount}` : c.item}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Card className="bg-navy text-white space-y-3">
        <div className="text-sm font-medium opacity-80">2026 SAHYOG Impact Day</div>
        <div className="text-lg font-bold">Your Annual Impact Report</div>
        <p className="text-sm opacity-75">Download your personalised impact certificate for the year.</p>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
            View Report
          </Button>
          <Button variant="ghost" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
            Download Certificate
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* ── Food Rescue Flow ─────────────────────────────── */
function RescuePage() {
  const [step, setStep]     = useState("compose");
  const [text, setText]     = useState("");
  const [d, setD]           = useState(null);
  const [src, setSrc]       = useState("");
  const [busy, setBusy]     = useState(false);
  const [t, setT]           = useState(nowMin());
  const [pub, setPub]       = useState(null);
  const [pick, setPick]     = useState(null);
  const [otp, setOtp]       = useState("");
  const [ngoOtpInput, setNgoOtpInput] = useState("");
  const [confirmed, setConfirmed]     = useState(false);
  const [mapSel, setMapSel] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [rejSheet, setRejSheet] = useState(false);

  useEffect(() => {
    const i = setInterval(() => setT(nowMin() + new Date().getSeconds() / 60), 1000);
    return () => clearInterval(i);
  }, []);

  async function parse() {
    setBusy(true);
    try {
      const r = await fetch("/api/parse", { method: "POST", body: JSON.stringify({ text }) });
      const j = await r.json();
      setD(j.data); setSrc(j.source);
    } catch {
      setD({}); setSrc("Error — please fill manually");
    }
    setBusy(false);
    setStep("review");
  }

  const setField = (k, v) => setD({ ...d, [k]: v === "" ? null : v });
  const a   = d ? analyze(d, t) : null;
  const canPub = a && !a.missing.length && !a.conflicts.length;
  const live = pub ? analyze(pub, t) : null;
  const m    = pub ? rank(pub, live.left ?? 0, NGOS) : null;

  const urgencyBg = {
    medium: "bg-brand", high: "bg-warn", critical: "bg-bad", expired: "bg-navy/40", unknown: "bg-muted"
  };

  const timelineSteps = pick ? [
    { label: "Listing Created",   done: true },
    { label: "Safety Reviewed",   done: true },
    { label: "NGO Matched",       done: true },
    { label: "NGO Accepted",      done: true },
    { label: "Pickup In Progress", done: confirmed, active: !confirmed },
    { label: "Handover Complete", done: confirmed },
  ] : pub ? [
    { label: "Listing Created",   done: true },
    { label: "Safety Reviewed",   done: true },
    { label: "Matching Started",  done: true },
    { label: "NGO Acceptance Pending", done: false, active: true },
    { label: "Pickup",            done: false },
    { label: "Handover",          done: false },
  ] : [];

  function reset() {
    setStep("compose"); setText(""); setD(null); setPub(null);
    setPick(null); setNgoOtpInput(""); setConfirmed(false); setMapSel(null);
  }

  /* ── Compose ── */
  if (step === "compose") return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-navy">Rescue Surplus Food</h1>
        <p className="text-sm text-muted mt-1">Describe it naturally. SAHYOG AI will structure your listing.</p>
      </div>

      <div className="space-y-3">
        <Textarea id="food-message" rows={5}
          placeholder="I have around 80 meals of rice, dal and paneer left from an event in Andheri. Prepared at 10:00 PM and pickup is possible."
          value={text} onChange={e => setText(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          {SAMPLES.map((s, i) => (
            <button key={i} onClick={() => setText(s)}
              className="rounded-full border border-border bg-white px-3 py-1.5 text-xs text-navy hover:border-brand hover:text-brand transition-colors">
              Sample {i + 1}
            </button>
          ))}
        </div>
        <div className="bg-cream border border-border rounded-xl p-3 text-xs text-muted">
          ℹ️ AI extracts only what you explicitly state. Unknown values remain empty.
        </div>
      </div>

      <div>
        <button onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2 text-sm text-brand font-medium mb-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {showMap ? "Hide" : "View"} NGO Network Map
        </button>
        {showMap && (
          <div className="rounded-2xl overflow-hidden border border-border animate-slide-up">
            <MapView ngos={NGOS} stations={STATIONS} h={240} onPick={setMapSel} />
          </div>
        )}
        {mapSel && (
          <Card className="mt-2 animate-slide-up space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">{mapSel.name}</span>
              <button onClick={() => setMapSel(null)} className="text-muted text-xs hover:text-navy">✕</button>
            </div>
            <div className="text-xs text-muted">{mapSel.area} · {mapSel.type}</div>
            <div className="flex gap-2 mt-1">
              <Badge variant={mapSel.food.includes("nonveg") ? "default" : "success"}>
                {mapSel.food.includes("nonveg") ? "Veg & Non-veg" : "Veg only"}
              </Badge>
              <Badge variant="brand">Pickup: {mapSel.pickup}</Badge>
            </div>
          </Card>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Button variant="orange" size="xl" className="w-full" disabled={!text || busy} onClick={parse}>
          {busy ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              Structuring your donation…
            </span>
          ) : "Generate Listing"}
        </Button>
        <button onClick={() => { setD({}); setSrc("Manual"); setStep("review"); }}
          className="text-sm text-muted underline text-center hover:text-navy transition-colors">
          Fill details manually instead
        </button>
      </div>
    </div>
  );

  /* ── Review ── */
  if (step === "review" && d) {
    const foodOptions = [
      { value: "", label: "Select type" },
      { value: "veg", label: "Vegetarian" },
      { value: "nonveg", label: "Non-vegetarian" },
    ];
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="flex items-center gap-3">
          <button onClick={() => setStep("compose")} className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted hover:text-navy hover:border-navy transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-navy">Review Your Listing</h1>
            <p className="text-xs text-muted">{src.startsWith("AI") ? "AI-extracted — please verify all fields" : "Manual entry"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <label htmlFor="meals" className="block text-sm font-medium text-navy">
              Estimated Meals
            </label>
            <input id="meals" type="number" value={d.meals ?? ""} onChange={e => setField("meals", e.target.value ? +e.target.value : "")}
              placeholder="e.g. 80"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors ${d.meals ? "border-border" : "border-warn bg-warn/5"}`} />
            {!d.meals && <p className="text-xs text-warn">Required</p>}
          </div>
          <Select id="food-type" label="Food Type" options={foodOptions}
            value={d.food_type ?? ""} onChange={e => setField("food_type", e.target.value)}
            error={!d.food_type ? "Required" : ""} />
          <Input id="prepared-at" label="Prepared At" type="time"
            value={d.prepared_at ?? ""} onChange={e => setField("prepared_at", e.target.value)}
            error={!d.prepared_at ? "Required" : ""}
            hint={d.prepared_at && src.startsWith("AI") ? "AI extracted — confirm" : ""} />
          <Input id="packed-at" label="Packed At (optional)" type="time"
            value={d.packed_at ?? ""} onChange={e => setField("packed_at", e.target.value)} />
          <div className="col-span-2">
            <Input id="location" label="Location / Area" placeholder="e.g. Kandivali"
              value={d.location ?? ""} onChange={e => setField("location", e.target.value)}
              error={!d.location ? "Required" : ""}
              hint={d.location && src.startsWith("AI") ? "AI extracted — confirm" : ""} />
          </div>
          <Input id="temp" label="Temperature °C (optional)" type="number"
            value={d.temperature_c ?? ""} onChange={e => setField("temperature_c", e.target.value ? +e.target.value : "")} />
        </div>

        {a?.missing.length > 0 && (
          <div className="bg-warn/10 border border-warn/30 rounded-xl p-3 text-sm text-amber-700">
            ⚠ Missing required fields: <strong>{a.missing.join(", ")}</strong>
          </div>
        )}
        {a?.conflicts.map(c => (
          <div key={c} className="bg-bad/10 border border-bad/30 rounded-xl p-3 text-sm text-bad">✖ {c}</div>
        ))}

        {/* Safety information */}
        <Card className="space-y-3">
          <h3 className="text-sm font-semibold text-navy">Safety Information</h3>
          <div className="space-y-2 text-sm">
            {[
              ["Preparation Time", d.prepared_at || "Not provided"],
              ["Packing / Holding", d.packed_at || "Not provided"],
              ["Food Type", d.food_type || "Not provided"],
              ["Temperature", d.temperature_c != null ? `${d.temperature_c}°C` : "Not provided"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2">
                <span className="text-muted">{k}</span>
                <span className={`font-medium ${v === "Not provided" ? "text-muted" : "text-navy"}`}>{v}</span>
              </div>
            ))}
          </div>
          <div className={`rounded-lg px-3 py-2 text-xs font-medium ${canPub ? "bg-ok/10 text-ok" : "bg-warn/10 text-amber-700"}`}>
            {canPub ? "✓ Safety information complete" : "⚠ Additional information required"}
          </div>
          <p className="text-xs text-muted">
            The rescue window is a platform rule (4 hours from preparation) — not a food-safety certificate. SAHYOG does not certify food safety.
          </p>
        </Card>

        <Button variant="orange" size="xl" className="w-full" disabled={!canPub}
          onClick={() => { setPub(d); setStep("live"); }}>
          Publish & Find NGOs →
        </Button>
      </div>
    );
  }

  /* ── Live ── */
  if (step === "live" && pub) {
    return (
      <div className="space-y-5 animate-fade-in">
        {/* Rescue window */}
        <div className={`rounded-2xl p-5 text-white ${urgencyBg[live.urgency] || "bg-muted"}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium opacity-90">Rescue Window</span>
            <UrgencyBadge urgency={live.urgency} />
          </div>
          <div className="text-5xl font-bold countdown-digit my-2">
            {live.left == null ? "--:--:--" : fmtCountdown(live.left)}
          </div>
          <div className="text-sm opacity-80">{pub.meals} meals · {pub.food_type} · {pub.location}</div>
          {live.left != null && live.left > 0 && (
            <div className="mt-3 bg-white/20 rounded-full h-1.5">
              <div className="bg-white rounded-full h-1.5 transition-all duration-1000"
                style={{ width: `${Math.min(100, 100 - (live.left / (4 * 60)) * 100)}%` }} />
            </div>
          )}
        </div>

        {/* Timeline */}
        <Card>
          <h3 className="text-sm font-semibold text-navy mb-3">Rescue Progress</h3>
          <Timeline steps={timelineSteps} />
        </Card>

        {/* Map */}
        {!pick && m && (
          <div className="rounded-2xl overflow-hidden border border-border">
            <MapView ngos={NGOS} stations={STATIONS}
              donor={COORD[zoneKey(pub.location)]}
              hi={m.ranked.slice(0, 3).map(r => r.n.id)} h={220} onPick={setMapSel} />
          </div>
        )}
        {mapSel && !pick && (
          <Card className="animate-slide-up space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">{mapSel.name}</span>
              <button onClick={() => setMapSel(null)} className="text-muted text-xs">✕</button>
            </div>
            <div className="text-xs text-muted">{mapSel.area} · {mapSel.type}</div>
          </Card>
        )}

        {/* Content based on state */}
        {live.left <= 0 ? (
          <Card className="border-2 border-bad space-y-2">
            <h3 className="font-semibold text-bad">Rescue Window Expired</h3>
            <p className="text-sm text-muted">Human food matching has ended. Please contact an animal feed or composting partner for this batch.</p>
          </Card>
        ) : confirmed ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-slide-up">
            <div className="w-20 h-20 rounded-full bg-ok flex items-center justify-center text-white text-3xl">✓</div>
            <h2 className="text-xl font-bold text-navy">Rescue Completed!</h2>
            <p className="text-sm text-muted text-center">
              {pub.meals} meals successfully redirected to {pick.n.name}.
            </p>
            <Card className="w-full space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted">NGO</span><span className="font-medium">{pick.n.name}</span></div>
              <div className="flex justify-between"><span className="text-muted">Meals rescued</span><span className="font-medium text-ok">{pub.meals}</span></div>
              <div className="flex justify-between"><span className="text-muted">Food type</span><span className="font-medium capitalize">{pub.food_type}</span></div>
            </Card>
            <p className="text-sm text-muted text-center max-w-xs">Your contribution has been added to your impact profile.</p>
            <Button variant="brand" onClick={reset}>Start New Rescue</Button>
          </div>
        ) : pick ? (
          <HandoverPanel pub={pub} pick={pick} otp={otp}
            ngoOtpInput={ngoOtpInput} setNgoOtpInput={setNgoOtpInput}
            onConfirm={() => { if (ngoOtpInput === otp) setConfirmed(true); }}
            confirmed={confirmed} />
        ) : (
          <>
            {m.ranked.length === 0 ? (
              <EmptyState icon="📍" title="No eligible NGOs found"
                body="Try expanding the rescue zone or contact volunteers to escalate."
                action={<Button variant="ghost" onClick={reset}>Start New Listing</Button>} />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-navy">Best Matches</h2>
                  <span className="text-xs text-muted">{m.ranked.length} eligible NGO{m.ranked.length > 1 ? "s" : ""}</span>
                </div>
                {m.ranked.slice(0, 3).map(({ n, score, reason }) => (
                  <NGOMatchCard key={n.id} n={n} score={score} reason={reason}
                    onAccept={() => { setPick({ n }); setOtp(String(1000 + Math.floor(Math.random() * 9000))); }} />
                ))}
                {m.rejected.length > 0 && (
                  <>
                    <button onClick={() => setRejSheet(true)}
                      className="text-sm text-muted underline hover:text-navy transition-colors">
                      Why were {m.rejected.length} NGO{m.rejected.length > 1 ? "s" : ""} excluded?
                    </button>
                    <BottomSheet open={rejSheet} onClose={() => setRejSheet(false)} title="Excluded NGOs">
                      <div className="space-y-3 max-h-72 overflow-y-auto">
                        {m.rejected.map(({ n, why }) => (
                          <div key={n.id} className="text-sm">
                            <div className="font-medium text-navy">{n.name}</div>
                            <div className="text-muted text-xs mt-0.5">{why.join(" · ")}</div>
                          </div>
                        ))}
                      </div>
                    </BottomSheet>
                  </>
                )}
              </div>
            )}
          </>
        )}

        <button onClick={reset} className="text-sm text-muted underline hover:text-navy transition-colors block">
          ← Start a new listing
        </button>
      </div>
    );
  }

  return null;
}

/* ── Home Page ────────────────────────────────────── */
function HomePage({ setActivePage }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const actions = [
    {
      id: "rescue",
      emoji: "🍽️",
      title: "Rescue Surplus Food",
      desc: "Help redirect fresh surplus food before the rescue window closes.",
      color: "bg-brand",
      textColor: "text-brand",
      bgLight: "bg-brand/8",
    },
    {
      id: "needs",
      emoji: "💙",
      title: "Fulfil a Need",
      desc: "See what local NGOs need right now — food, clothes, books & more.",
      color: "bg-ok",
      textColor: "text-ok",
      bgLight: "bg-ok/8",
    },
    {
      id: "donate",
      emoji: "💰",
      title: "Support an NGO",
      desc: "Contribute money or essential items to organizations near you.",
      color: "bg-orange",
      textColor: "text-orange",
      bgLight: "bg-orange/8",
    },
  ];

  const stats = [
    { label: "Meals Rescued",   value: DEMO_IMPACT.mealsRescued,  suffix: "" },
    { label: "Needs Fulfilled", value: DEMO_IMPACT.needsFulfilled, suffix: "" },
    { label: "NGOs Supported",  value: DEMO_IMPACT.ngosSupported,  suffix: "" },
    { label: "People Reached",  value: DEMO_IMPACT.peopleReached,  suffix: "" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Greeting */}
      <div>
        <p className="text-sm text-muted">{greeting}</p>
        <h1 className="text-2xl font-bold text-navy mt-0.5">How would you like to help today?</h1>
      </div>

      {/* Action cards */}
      <div className="space-y-3">
        {actions.map(a => (
          <button key={a.id} onClick={() => setActivePage(a.id)}
            className={`w-full text-left rounded-2xl ${a.bgLight} border border-transparent hover:border-current/20 p-4 flex items-start gap-4 transition-all duration-150 hover:shadow-card group card-hover`}>
            <div className={`w-12 h-12 rounded-xl ${a.color} flex items-center justify-center text-2xl flex-none text-white shadow-sm`}>
              {a.emoji}
            </div>
            <div className="flex-1">
              <div className={`font-semibold text-base ${a.textColor}`}>{a.title}</div>
              <div className="text-sm text-muted mt-0.5 leading-snug">{a.desc}</div>
            </div>
            <svg className="w-5 h-5 text-muted mt-1 flex-none group-hover:translate-x-0.5 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        ))}
      </div>

      {/* Platform impact */}
      <div>
        <h2 className="text-base font-semibold text-navy mb-3">Platform Impact</h2>
        <div className="grid grid-cols-2 gap-3">
          {stats.map(s => (
            <Card key={s.label} className="text-center py-3">
              <div className="text-2xl font-bold text-navy">
                <CountUp target={s.value} suffix={s.suffix} />
              </div>
              <div className="text-xs text-muted mt-0.5">{s.label}</div>
            </Card>
          ))}
        </div>
        <p className="text-xs text-muted mt-2 text-center">Demo estimates — not real-time data</p>
      </div>

      {/* Active needs banner */}
      <Card className="bg-navy text-white flex items-center gap-3 py-3">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl flex-none">💙</div>
        <div className="flex-1">
          <div className="text-sm font-semibold">{NGO_NEEDS.filter(n => n.priority === "critical").length} critical needs near you</div>
          <div className="text-xs opacity-70 mt-0.5">NGOs are waiting for support</div>
        </div>
        <button onClick={() => setActivePage("needs")}
          className="text-xs font-semibold bg-white/15 hover:bg-white/25 transition-colors px-3 py-1.5 rounded-lg flex-none">
          View
        </button>
      </Card>
    </div>
  );
}

/* ── Bottom Nav (mobile) ──────────────────────────── */
function BottomNav({ active, setActive }) {
  const items = [
    { id: "home",   label: "Home",   icon: <HomeIcon /> },
    { id: "rescue", label: "Rescue", icon: <RescueIcon />, highlight: true },
    { id: "needs",  label: "Needs",  icon: <NeedsIcon /> },
    { id: "donate", label: "Donate", icon: <DonateIcon /> },
    { id: "impact", label: "Impact", icon: <ImpactIcon /> },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border safe-bottom">
      <div className="flex">
        {items.map(item => (
          <button key={item.id} onClick={() => setActive(item.id)}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors relative
              ${active === item.id ? "text-brand" : "text-muted hover:text-navy"}`}>
            {item.highlight && (
              <div className={`absolute -top-3 w-12 h-12 rounded-2xl flex items-center justify-center shadow-card
                ${active === item.id ? "bg-brand" : "bg-orange"} text-white`}>
                {item.icon}
              </div>
            )}
            {!item.highlight && (
              <>
                <span className={active === item.id ? "text-brand" : ""}>{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </>
            )}
            {item.highlight && <span className="text-[10px] font-medium mt-4">{item.label}</span>}
          </button>
        ))}
      </div>
    </nav>
  );
}

/* ── Sidebar (desktop) ────────────────────────────── */
function Sidebar({ active, setActive }) {
  const items = [
    { id: "home",   label: "Home",         icon: <HomeIcon /> },
    { id: "rescue", label: "Food Rescue",  icon: <RescueIcon /> },
    { id: "needs",  label: "Community Needs", icon: <NeedsIcon /> },
    { id: "donate", label: "Donations",    icon: <DonateIcon /> },
    { id: "impact", label: "My Impact",    icon: <ImpactIcon /> },
  ];
  return (
    <aside className="hidden lg:flex flex-col w-60 xl:w-64 h-screen sticky top-0 bg-white border-r border-border py-6 px-3">
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 mb-8">
        <img src="/logo.png" alt="SAHYOG" className="h-9 w-auto" />
        <div>
          <div className="font-bold text-navy text-sm leading-tight">SAHYOG</div>
          <div className="text-[10px] text-muted leading-tight">Connecting Needs. Creating Impact.</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {items.map(item => (
          <button key={item.id} onClick={() => setActive(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
              ${active === item.id
                ? "bg-brand/10 text-brand"
                : "text-muted hover:bg-navy/4 hover:text-navy"}`}>
            <span className={active === item.id ? "text-brand" : "text-muted"}>{item.icon}</span>
            {item.label}
            {item.id === "rescue" && (
              <span className="ml-auto w-2 h-2 rounded-full bg-orange animate-pulse" />
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border pt-4 px-3">
        <div className="text-xs text-muted">Mumbai NGO Network</div>
        <div className="text-xs text-muted mt-0.5">{NGOS.length} NGOs · Demo data</div>
      </div>
    </aside>
  );
}

/* ── Root ─────────────────────────────────────────── */
export default function App() {
  const [page, setPage] = useState("home");

  const pageMap = {
    home:   <HomePage setActivePage={setPage} />,
    rescue: <RescuePage />,
    needs:  <NeedsPage />,
    donate: <DonatePage />,
    impact: <ImpactPage />,
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar active={page} setActive={setPage} />

      {/* Main content */}
      <main className="flex-1 min-w-0 pb-24 lg:pb-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
          <img src="/logo.png" alt="SAHYOG" className="h-8 w-auto" />
          <div>
            <div className="text-sm font-bold text-navy leading-tight">SAHYOG</div>
            <div className="text-[9px] text-muted leading-tight">Connecting Needs. Creating Impact.</div>
          </div>
        </header>

        {/* Page content */}
        <div className="max-w-2xl mx-auto px-4 py-6 lg:px-8 lg:py-8">
          {pageMap[page]}
        </div>
      </main>

      <BottomNav active={page} setActive={setPage} />
    </div>
  );
}
