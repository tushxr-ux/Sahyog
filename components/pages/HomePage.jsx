"use client";
import { useState, useRef, useEffect } from "react";
import { NGOS } from "@/lib/ngos";
import { DEMO_IMPACT, NGO_NEEDS } from "@/lib/demo";
import { Button, Badge, CountUp, PulsingDot } from "@/components/ui";

const ACTIONS = [
  { id: "rescue", emoji: "⚡", label: "Rescue Food",    desc: "Redirect surplus food before the rescue window closes.", cls: "card-orange" },
  { id: "needs",  emoji: "💙", label: "Fulfil a Need",  desc: "See what local NGOs urgently need right now.",          cls: "card-green"  },
  { id: "donate", emoji: "💰", label: "Support an NGO", desc: "Contribute funds or items to community organisations.", cls: "card-blue"   },
];
const STATS = [
  { label: "Meals Rescued",   key: "mealsRescued",  gradient: "bg-brand text-white"     },
  { label: "Needs Fulfilled", key: "needsFulfilled", gradient: "bg-ok text-white"        },
  { label: "NGOs Supported",  key: "ngosSupported",  gradient: "bg-blue text-white"      },
  { label: "People Reached",  key: "peopleReached",  gradient: "bg-navy text-white"      },
];
const FEED = [
  { icon: "🍽", text: "78 meals rescued via Sadadevi Foundation", time: "4 min ago" },
  { icon: "💙", text: "20 blankets fulfilled · Community Outreach", time: "11 min ago" },
  { icon: "✅", text: "NGO matched in 4 min · Malad area", time: "23 min ago" },
];
const HOW = [
  { n: "1", title: "Describe your surplus", body: "Tell us what food you have in plain language — AI structures it instantly." },
  { n: "2", title: "Match with an NGO",     body: "Our algorithm finds the closest eligible NGO within the rescue window." },
  { n: "3", title: "Handover & Impact",     body: "A coordinator picks up and you see the impact added to your profile." },
];

export default function HomePage({ setPage }) {
  const h = new Date().getHours();
  const greet = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  const criticalCount = NGO_NEEDS.filter(n => n.priority === "critical").length;

  return (
    <div className="space-y-10 anim-fade-in">

      {/* ── Hero ─────────────────────────────────── */}
      <div className="hero-band page-hero relative overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-brand/8 rounded-full pointer-events-none" />
        <div className="absolute -bottom-8 -left-6  w-32 h-32 bg-blue/6  rounded-full pointer-events-none" />

        {/* Text content */}
        <div className="relative p-6 lg:p-0">
          <p className="text-sm font-bold text-brand mb-1">{greet} 👋</p>
          <h1 className="text-3xl lg:text-5xl font-black text-navy leading-tight">
            Connect surplus food<br className="hidden lg:block" /> to those who need it.
          </h1>
          <p className="text-sm lg:text-lg text-muted mt-3 max-w-md leading-relaxed">
            SAHYOG bridges food donors, NGOs, and citizens across Mumbai through real-time matching and community-driven care.
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button onClick={() => setPage("rescue")}
              className="btn-cta px-6 py-3 text-sm rounded-xl font-bold">⚡ Rescue Food Now</button>
            <button onClick={() => setPage("needs")}
              className="px-5 py-3 text-sm font-bold rounded-xl bg-white border border-border text-navy hover:bg-slate-50 transition-colors" style={{ minHeight: "auto" }}>
              View Needs →
            </button>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <PulsingDot color="bg-ok" />
            <span className="text-xs text-ok font-bold">Live rescue network · {NGOS.length} NGOs active across Mumbai</span>
          </div>
        </div>

        {/* Desktop: stats panel on the right */}
        <div className="hidden lg:grid grid-cols-2 gap-3 min-w-[280px]">
          {STATS.map(s => (
            <div key={s.label} className={`rounded-2xl p-4 ${s.gradient}`}>
              <div className="text-2xl font-black"><CountUp target={DEMO_IMPACT[s.key]} /></div>
              <div className="text-[11px] font-bold opacity-70 mt-0.5 uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Mobile stats (hidden on desktop, shown above in hero) ── */}
      <div className="grid grid-cols-2 gap-3 stats-grid lg:hidden">
        {STATS.map(s => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.gradient}`}>
            <div className="text-2xl font-black"><CountUp target={DEMO_IMPACT[s.key]} /></div>
            <div className="text-[11px] font-bold opacity-70 mt-0.5 uppercase tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Action cards ─────────────────────────── */}
      <div className="action-grid space-y-3 lg:space-y-0">
        {ACTIONS.map(a => (
          <button key={a.id} onClick={() => setPage(a.id)}
            className={`w-full text-left p-4 lg:p-5 flex items-center gap-4 ${a.cls} card-hover group transition-all duration-150`}>
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl flex-none shadow-card border border-border">
              {a.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-black text-navy text-sm lg:text-base">{a.label}</div>
              <p className="text-xs text-muted mt-0.5 leading-snug">{a.desc}</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="text-muted group-hover:text-brand flex-none transition-colors">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        ))}
      </div>

      {/* ── How it works (desktop only) ──────────── */}
      <div className="hidden lg:block section-gap">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-navy">How SAHYOG Works</h2>
          <p className="text-muted mt-2 text-sm">Three simple steps to rescue surplus food</p>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {HOW.map(s => (
            <div key={s.n} className="card-base p-6 text-center space-y-3">
              <div className="w-10 h-10 bg-brand rounded-xl text-white font-black text-lg flex items-center justify-center mx-auto shadow-orange">{s.n}</div>
              <h3 className="font-black text-navy">{s.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Live activity ─────────────────────────── */}
      <div className="section-gap">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black text-muted uppercase tracking-widest">Live Activity</h2>
          <PulsingDot color="bg-ok" />
        </div>
        <div className="space-y-2 lg:grid lg:grid-cols-3 lg:gap-3 lg:space-y-0">
          {FEED.map((f, i) => (
            <div key={i} className="card-base flex items-center gap-3 px-4 py-3">
              <span className="text-xl flex-none">{f.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-navy font-medium leading-snug">{f.text}</p>
              </div>
              <span className="text-[10px] text-muted flex-none hidden lg:block">{f.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Critical needs banner ─────────────────── */}
      <div className="card-orange p-4 lg:p-5 flex items-center gap-4">
        <div className="w-11 h-11 bg-brand rounded-xl flex items-center justify-center text-xl flex-none text-white shadow-orange">🚨</div>
        <div className="flex-1">
          <div className="text-sm lg:text-base font-black text-navy">{criticalCount} critical needs nearby</div>
          <div className="text-xs text-muted mt-0.5">NGOs are waiting for urgent support right now</div>
        </div>
        <Button variant="primary" size="sm" onClick={() => setPage("needs")}>View →</Button>
      </div>
    </div>
  );
}
