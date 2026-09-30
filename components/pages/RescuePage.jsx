"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { NGOS, STATIONS, COORD } from "@/lib/ngos";
import { analyze, rank, zoneKey } from "@/lib/rules";
import { Button, Badge, Input, Select, Textarea, ProgressBar, EmptyState, UrgencyBadge, BottomSheet, Toast, PulsingDot } from "@/components/ui";

const MapView = dynamic(() => import("@/app/MapView"), { ssr: false });

const nowMin = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };
const fmt = x => {
  const s = Math.max(0, Math.round(x * 60));
  return [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map(v => String(v).padStart(2, "0")).join(":");
};
const SAMPLES = [
  "80 plates rice dal paneer from a wedding in Kandivali. Veg. Cooked 10 PM, packed 11 PM.",
  "60 veg meals from a catering event in Thakur Village. Cooked 9 PM.",
  "150 plates non-veg biryani in Charkop, cooked 11 PM.",
  "Around 40 veg plates from a family function in Malad. Cooked 7 PM.",
];

function Ic({ d, size = 20, sw = 1.8, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {typeof d === "string" ? <path d={d} /> : d}
    </svg>
  );
}
const check  = "M20 6L9 17l-5-5";
const back   = "M19 12H5M12 19l-7-7 7-7";
const shield = "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z";
const spin   = "M21 12a9 9 0 1 1-6.219-8.56";
const mapPin = "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z";
const arr    = "M9 18l6-6-6-6";
const closeX = "M18 6L6 18M6 6l12 12";
const clock  = <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>;

function RescueRing({ left, total = 240 }) {
  const pct = left == null ? 0 : Math.max(0, Math.min(1, left / total));
  const r = 54, c = 2 * Math.PI * r;
  const stroke = left == null ? "#d1d9e8" : left <= 0 ? "#DC2626" : left < 45 ? "#DC2626" : left < 90 ? "#D97706" : "#F97316";
  return (
    <div className="relative flex items-center justify-center" style={{ width: 136, height: 136 }}>
      <svg width="136" height="136" viewBox="0 0 136 136">
        <circle cx="68" cy="68" r={r} fill="none" stroke="#f1f5f9" strokeWidth="9" />
        <circle cx="68" cy="68" r={r} fill="none" stroke={stroke} strokeWidth="9"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
          strokeLinecap="round" className="ring-progress" />
      </svg>
      <div className="absolute text-center">
        <div className="text-xl font-black text-navy tabular">{left == null ? "--:--" : fmt(left)}</div>
        <div className="text-[9px] text-muted uppercase tracking-wider mt-0.5">remaining</div>
      </div>
    </div>
  );
}

function Timeline({ steps }) {
  return (
    <div>
      {steps.map((s, i) => (
        <div key={i} className={`tl-step ${s.done ? "done" : ""}`}>
          <div className={`flex-none w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all
            ${s.done ? "border-ok bg-ok text-white" : s.active ? "border-brand bg-orange-50" : "border-border bg-white"}`}>
            {s.done ? <Ic d={check} size={12} sw={3} />
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

function NGOCard({ n, score, reason, onAccept, top }) {
  const eta = parseInt(reason) || 20;
  return (
    <div className={`card-base p-4 space-y-3 card-hover anim-slide-up ${top ? "border-brand/30 shadow-orange" : ""}`}>
      {top && <div className="-mt-1 mb-1"><Badge variant="brand">⭐ Best Match</Badge></div>}
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
        {[["🕐", `${eta} min`, "ETA"], ["🍽", `${n.needToday}`, "Capacity"], ["🚗", n.pickup === "own" ? "Own" : "Vol.", "Pickup"]].map(([emoji, val, lbl]) => (
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

const urgencyStyle = {
  medium:   "bg-blue-50  border-blue-200",
  high:     "bg-amber-50 border-amber-200",
  critical: "bg-red-50   border-red-200",
  expired:  "bg-slate-100 border-border",
  unknown:  "bg-slate-100 border-border",
};

export default function RescuePage() {
  const [step, setStep]     = useState("compose");
  const [text, setText]     = useState("");
  const [d, setD]           = useState(null);
  const [src, setSrc]       = useState("");
  const [busy, setBusy]     = useState(false);
  const [t, setT]           = useState(nowMin());
  const [pub, setPub]       = useState(null);
  const [pick, setPick]     = useState(null);
  const [otp, setOtp]       = useState("");
  const [ngoInp, setNgoInp] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [mapSel, setMapSel] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [rejSheet, setRejSheet] = useState(false);
  const [toast, setToast]   = useState({ visible: false, message: "", type: "success" });

  useEffect(() => {
    const i = setInterval(() => setT(nowMin() + new Date().getSeconds() / 60), 1000);
    return () => clearInterval(i);
  }, []);

  const flash = (message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(p => ({ ...p, visible: false })), 3000);
  };

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

  const reset = () => {
    setStep("compose"); setText(""); setD(null); setPub(null);
    setPick(null); setNgoInp(""); setConfirmed(false); setMapSel(null);
  };

  /* ── COMPOSE ── */
  if (step === "compose") return (
    <div className="space-y-6 anim-fade-in">
      <Toast {...toast} />
      <div>
        <div className="flex items-center gap-2 mb-1"><span className="text-2xl">⚡</span><h1 className="text-2xl font-black text-navy">Rescue Surplus Food</h1></div>
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
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-2 items-start">
        <Ic d={shield} size={14} className="text-blue flex-none mt-0.5" />
        <p className="text-xs text-navy/60">AI extracts only what you explicitly state. Unknown fields stay empty — never invented.</p>
      </div>
      <div className="space-y-2">
        <button onClick={parse} disabled={!text || busy}
          className="btn-cta w-full py-3.5 text-base anim-pulse-o" style={{ fontSize: "1rem" }}>
          {busy ? <span className="flex items-center justify-center gap-2"><Ic d={spin} size={18} className="anim-spin" /> Structuring…</span> : "Generate Listing →"}
        </button>
        <button onClick={() => { setD({}); setSrc("Manual"); setStep("review"); }}
          className="w-full text-center text-sm text-muted hover:text-navy py-1 font-medium" style={{ minHeight: "auto" }}>
          Skip AI — fill manually
        </button>
      </div>
      <div>
        <button onClick={() => setShowMap(!showMap)}
          className="flex items-center gap-2 text-sm text-brand font-bold mb-3 hover:text-brand-hover transition-colors" style={{ minHeight: "auto" }}>
          <Ic d={mapPin} size={16} />
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
              <Badge variant={mapSel.food.includes("nonveg") ? "warn" : "success"} className="mt-2">
                {mapSel.food.includes("nonveg") ? "Veg & Non-veg" : "Veg only"}
              </Badge>
            </div>
            <button onClick={() => setMapSel(null)} className="text-muted hover:text-navy transition-colors p-1" style={{ minHeight: "auto" }}>
              <Ic d={closeX} size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  /* ── REVIEW ── */
  if (step === "review" && d) {
    const foodOpts = [{ value: "", label: "Select type" }, { value: "veg", label: "Vegetarian" }, { value: "nonveg", label: "Non-vegetarian" }];
    return (
      <div className="space-y-5 anim-fade-in">
        <Toast {...toast} />
        <div className="flex items-center gap-3">
          <button onClick={() => setStep("compose")}
            className="w-9 h-9 card-base rounded-xl flex items-center justify-center text-muted hover:text-navy" style={{ minHeight: "auto" }}>
            <Ic d={back} size={16} />
          </button>
          <div>
            <h1 className="text-xl font-black text-navy">Review Listing</h1>
            <p className="text-xs text-muted">{src.startsWith("AI") ? "AI extracted — verify all fields" : "Manual entry"}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-navy/70">Estimated Meals</label>
            <input type="number" placeholder="e.g. 80" value={d.meals ?? ""} onChange={e => setF("meals", e.target.value ? +e.target.value : "")}
              className={`inp-light ${!d.meals ? "err" : ""}`} />
            {!d.meals && <p className="text-xs text-red-500 font-medium">Required</p>}
          </div>
          <Select id="ftype" label="Food Type" options={foodOpts}
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
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700 flex gap-2">
            ⚠ Required: <strong>{a.missing.join(", ")}</strong>
          </div>
        )}
        {a?.conflicts.map(c => (
          <div key={c} className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 flex gap-2">✖ {c}</div>
        ))}
        <div className="card-base p-4 space-y-3">
          <div className="flex items-center gap-2"><Ic d={shield} size={16} className="text-brand" /><h3 className="text-sm font-black text-navy">Safety Information</h3></div>
          <div className="divide-y divide-border">
            {[["Preparation time", d.prepared_at], ["Packing / holding", d.packed_at], ["Food type", d.food_type], ["Temperature", d.temperature_c != null ? `${d.temperature_c}°C` : null]].map(([k, v]) => (
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
          disabled={!canPub} className="btn-cta w-full py-3.5 text-base" style={{ fontSize: "1rem" }}>
          Publish & Match NGOs →
        </button>
      </div>
    );
  }

  /* ── LIVE ── */
  if (step === "live" && pub) {
    const urg = live.urgency || "unknown";
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
        <div className={`rounded-2xl p-5 flex items-center gap-5 border ${urgencyStyle[urg] || urgencyStyle.unknown}`}>
          <RescueRing left={live.left} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <UrgencyBadge urgency={urg} />
              {!pick && !confirmed && <PulsingDot color="bg-brand" />}
            </div>
            <div className="text-xl font-black text-navy">{pub.meals} meals</div>
            <div className="text-sm text-muted mt-0.5 capitalize">{pub.food_type} · {pub.location}</div>
            {live.left != null && live.left > 0 && <ProgressBar value={Math.max(0, (live.left / (4 * 60)) * 100)} color="bg-brand" className="mt-3" />}
          </div>
        </div>
        <div className="card-base p-4">
          <h3 className="text-xs font-black text-muted uppercase tracking-widest mb-3">Rescue Progress</h3>
          <Timeline steps={tlSteps} />
        </div>
        {!pick && m && (
          <div className="rounded-2xl overflow-hidden border border-border shadow-card">
            <MapView ngos={NGOS} stations={STATIONS}
              donor={COORD[zoneKey(pub.location)]}
              hi={m.ranked.slice(0, 3).map(r => r.n.id)} h={220} onPick={setMapSel} />
          </div>
        )}
        {live.left <= 0 ? (
          <div className="card-critical p-5 space-y-2">
            <div className="text-red-600 font-black">Rescue Window Expired</div>
            <p className="text-sm text-muted">Human food matching has ended. Contact animal feed or composting partners.</p>
          </div>
        ) : confirmed ? (
          <div className="flex flex-col items-center py-12 space-y-4 anim-slide-up">
            <div className="w-20 h-20 bg-ok rounded-3xl flex items-center justify-center text-white text-4xl">✓</div>
            <h2 className="text-2xl font-black text-navy">Rescue Completed!</h2>
            <p className="text-sm text-muted text-center">{pub.meals} meals → <strong className="text-navy">{pick.n.name}</strong></p>
            <Button variant="primary" size="lg" onClick={reset}>Start New Rescue</Button>
          </div>
        ) : pick ? (
          <div className="space-y-4">
            <h2 className="font-black text-navy text-lg">Handover</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="card-orange p-5 space-y-4">
                <div className="text-xs text-muted font-bold uppercase tracking-widest">Donor Screen</div>
                <div className="text-center py-4">
                  <div className="text-xs text-muted uppercase tracking-widest mb-2">Handover Code</div>
                  <div className="text-6xl font-black tracking-[0.2em] text-brand tabular">{otp}</div>
                  <p className="text-xs text-muted mt-3">Share only on physical handover</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-xs font-bold text-green-700 flex gap-2 items-center">
                  <PulsingDot color="bg-ok" /> Pickup in progress
                </div>
              </div>
              <div className="card-base p-5 space-y-4">
                <div className="text-xs text-muted font-bold uppercase tracking-widest">NGO Screen</div>
                {ngoInp === "ok" ? (
                  <div className="flex flex-col items-center py-8 space-y-3 anim-slide-up">
                    <div className="w-16 h-16 bg-ok rounded-2xl flex items-center justify-center text-white text-3xl">✓</div>
                    <p className="font-black text-ok">{pub.meals} meals delivered!</p>
                  </div>
                ) : (
                  <>
                    <Input id="otp-inp" label="Handover Code" placeholder="0000"
                      value={ngoInp} onChange={e => setNgoInp(e.target.value)}
                      className="text-center text-2xl tracking-[0.3em] font-black" />
                    <Button variant="success" size="lg" className="w-full" disabled={ngoInp.length < 4}
                      onClick={() => { if (ngoInp === otp) { setNgoInp("ok"); setConfirmed(true); flash("Rescue completed! 🎉"); } else flash("Incorrect code", "error"); }}>
                      Confirm Handover
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : m.ranked.length === 0 ? (
          <EmptyState icon="📍" title="No eligible NGOs found" body="Try expanding the rescue zone or contact volunteers."
            action={<Button variant="ghost" onClick={reset}>Start New Listing</Button>} />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-navy text-lg">Best Matches</h2>
              <span className="text-xs text-muted">{m.ranked.length} eligible</span>
            </div>
            <div className="space-y-3 ngo-grid">
              {m.ranked.slice(0, 3).map(({ n, score, reason }, i) => (
                <NGOCard key={n.id} n={n} score={score} reason={reason} top={i === 0}
                  onAccept={() => { setPick({ n }); setOtp(String(1000 + Math.floor(Math.random() * 9000))); flash(`${n.name} will pick up in ~${parseInt(reason)} min`); }} />
              ))}
            </div>
            {m.rejected.length > 0 && (
              <button onClick={() => setRejSheet(true)} className="text-sm text-muted underline hover:text-navy" style={{ minHeight: "auto" }}>
                Why were {m.rejected.length} NGOs excluded?
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
        <button onClick={reset} className="text-sm text-muted hover:text-navy font-medium" style={{ minHeight: "auto" }}>← Start a new listing</button>
      </div>
    );
  }
  return null;
}
