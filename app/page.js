"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { NGOS } from "@/lib/ngos";
import { NGO_NEEDS } from "@/lib/demo";
import { BottomSheet, PulsingDot } from "@/components/ui";

// ── Lazy-load each page (code-split per route) ──────────────
const HomePage   = dynamic(() => import("@/components/pages/HomePage"),   { ssr: false, loading: () => <PageSkeleton /> });
const RescuePage = dynamic(() => import("@/components/pages/RescuePage"), { ssr: false, loading: () => <PageSkeleton /> });
const NeedsPage  = dynamic(() => import("@/components/pages/NeedsPage"),  { ssr: false, loading: () => <PageSkeleton /> });
const DonatePage = dynamic(() => import("@/components/pages/DonatePage"), { ssr: false, loading: () => <PageSkeleton /> });
const ImpactPage = dynamic(() => import("@/components/pages/ImpactPage"), { ssr: false, loading: () => <PageSkeleton /> });
// Leaflet map: already dynamically imported inside RescuePage

// ── Shared data ──────────────────────────────────────────────
const FEED = [
  "🍽 78 meals rescued · Sadadevi Foundation · Kandivali",
  "💙 20 blankets fulfilled · Community Outreach · Mumbai Central",
  "✅ NGO matched in 4 min · Prayatna · Malad",
  "🥘 120 meals rescued · SUPPORT Kitchen · Santacruz",
  "📦 School bags delivered · Child Vision · Dahisar",
  "⚡ Rescue completed · Tweet Foundation · Goregaon",
];

const NAV = [
  { id: "home",   label: "Home",         icon: "🏠" },
  { id: "rescue", label: "Rescue Food",  icon: "⚡", badge: true  },
  { id: "needs",  label: "Needs",        icon: "💙", count: true  },
  { id: "donate", label: "Donate",       icon: "💰" },
  { id: "impact", label: "My Impact",    icon: "📊" },
];

// ── Page skeleton ────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-40 bg-slate-100 rounded-2xl" />
      <div className="h-24 bg-slate-100 rounded-2xl" />
      <div className="h-24 bg-slate-100 rounded-2xl" />
    </div>
  );
}

// ── Splash screen (PWA-only, shown 1.8s on install launch) ──
function SplashScreen({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "linear-gradient(145deg, #fff7ed 0%, #fffbf7 60%, #fff1e6 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: "1.25rem",
      animation: "splash-out 0.4s ease 1.4s both",
    }}>
      <div style={{
        width: 96, height: 96, borderRadius: "1.75rem",
        background: "#F97316", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 8px 32px rgba(249,115,22,0.35)",
        animation: "splash-logo 0.5s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        <Image src="/logo.png" alt="SAHYOG" width={60} height={60} className="object-contain" priority />
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontWeight: 900, fontSize: "1.5rem", color: "#1a1f36", letterSpacing: "-0.02em" }}>SAHYOG</div>
        <div style={{ fontSize: "0.75rem", color: "#6b7a99", fontWeight: 600, marginTop: 2 }}>Connecting Needs. Creating Impact.</div>
      </div>
      <div style={{ width: 40, height: 3, borderRadius: 99, background: "#F97316", opacity: 0.5, marginTop: 8 }} />
    </div>
  );
}


// ── Live ticker (memoised — never re-renders) ────────────────
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

// ── Notification panel ───────────────────────────────────────
const NOTIFS = [
  { icon: "✅", title: "Rescue accepted",     body: "Sadadevi Foundation accepted your listing.", time: "2 min ago", unread: true  },
  { icon: "⚡", title: "Pickup in 12 min",   body: "Driver is on the way to Kandivali.",          time: "5 min ago", unread: true  },
  { icon: "💙", title: "New need near you",  body: "Child Vision needs 20 school bags.",          time: "18 min ago", unread: false },
  { icon: "🏆", title: "First rescue done!", body: "You helped redirect 80 meals. Amazing!",      time: "2 days ago", unread: false },
];
function NotifPanel({ open, onClose }) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Notifications">
      <div className="space-y-2">
        {NOTIFS.map((n, i) => (
          <div key={i} className={`flex gap-3 p-3 rounded-xl border transition-colors
            ${n.unread ? "bg-orange-50 border-orange-100" : "bg-slate-50 border-border"}`}>
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl flex-none shadow-card border border-border">{n.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-navy">{n.title}</span>
                {n.unread && <span className="w-2 h-2 rounded-full bg-brand flex-none" />}
              </div>
              <p className="text-xs text-muted mt-0.5">{n.body}</p>
              <p className="text-[10px] text-muted/60 mt-1">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}

// ── Install Banner (PWA) ─────────────────────────────────────
function InstallBanner() {
  const [prompt, setPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    const h = e => { e.preventDefault(); setPrompt(e); setVisible(true); };
    window.addEventListener("beforeinstallprompt", h);
    window.addEventListener("appinstalled", () => setVisible(false));
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  if (!visible) return null;
  return (
    <div className="fixed bottom-20 left-4 right-4 lg:left-auto lg:right-6 lg:w-80 z-50 anim-slide-up">
      <div className="card-base p-4 shadow-card-lg border border-orange-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center flex-none shadow-orange overflow-hidden">
            <Image src="/logo.png" alt="SAHYOG" width={32} height={32} className="object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-black text-navy">Install SAHYOG</div>
            <div className="text-xs text-muted mt-0.5">Add to Home Screen for the best experience</div>
          </div>
          <button onClick={() => setVisible(false)}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 text-muted flex-none" style={{ minHeight: "auto" }}>
            ✕
          </button>
        </div>
        <button onClick={async () => { prompt?.prompt(); const { outcome } = await prompt.userChoice; if (outcome === "accepted") setVisible(false); }}
          className="btn-cta mt-3 w-full py-2.5 text-sm rounded-xl">Install Now</button>
      </div>
    </div>
  );
}

// ── Desktop top navbar ───────────────────────────────────────
function DesktopNav({ active, set, onNotif }) {
  const criticalCount = NGO_NEEDS.filter(n => n.priority === "critical").length;
  return (
    <header className="hidden lg:flex items-center justify-between px-8 py-0 bg-white border-b border-border sticky top-0 z-30 h-16">
      {/* Logo */}
      <button onClick={() => set("home")} className="flex items-center gap-2.5 flex-none" style={{ minHeight: "auto" }}>
        <Image src="/logo.png" alt="SAHYOG" width={36} height={36} className="object-contain" priority />
        <div>
          <div className="text-sm font-black text-navy leading-tight">SAHYOG</div>
          <div className="text-[9px] text-muted font-semibold leading-tight">Connecting Needs. Creating Impact.</div>
        </div>
      </button>

      {/* Nav links */}
      <nav className="flex items-center gap-1">
        {NAV.map(item => (
          <button key={item.id} onClick={() => set(item.id)}
            className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-150
              ${active === item.id
                ? "bg-orange-50 text-brand border border-orange-200"
                : "text-muted hover:text-navy hover:bg-slate-50"}`}>
            <span>{item.icon}</span>
            {item.label}
            {item.count && criticalCount > 0 && (
              <span className="w-4 h-4 text-[9px] font-black bg-brand text-white rounded-full flex items-center justify-center">{criticalCount}</span>
            )}
            {item.badge && active !== item.id && (
              <PulsingDot color="bg-brand" />
            )}
          </button>
        ))}
      </nav>

      {/* Right: status + bell */}
      <div className="flex items-center gap-3 flex-none">
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-muted font-semibold">
          <PulsingDot color="bg-ok" />
          <span>{NGOS.length} NGOs active</span>
        </div>
        <button onClick={onNotif}
          className="relative w-9 h-9 bg-slate-50 rounded-xl border border-border flex items-center justify-center text-muted hover:text-navy hover:bg-white transition-colors notif-rel"
          style={{ minHeight: "auto" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>
      </div>
    </header>
  );
}

// ── Mobile header ────────────────────────────────────────────
function MobileHeader({ onNotif }) {
  return (
    <header className="mobile-header-panel sticky top-0 z-30 lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="SAHYOG" width={32} height={32} className="object-contain" />
          <div>
            <div className="text-sm font-black text-navy leading-tight">SAHYOG</div>
            <div className="text-[9px] text-muted font-semibold">Connecting Needs. Creating Impact.</div>
          </div>
        </div>
        <button onClick={onNotif}
          className="w-9 h-9 bg-white rounded-xl border border-border shadow-card flex items-center justify-center text-muted hover:text-navy transition-colors notif-rel">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>
      </div>
      <Ticker />
    </header>
  );
}

// ── Mobile bottom nav ────────────────────────────────────────
function BottomNav({ active, set, onNotif }) {
  const criticalCount = NGO_NEEDS.filter(n => n.priority === "critical").length;
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bottom-nav-panel safe-bottom lg:hidden">
      <div className="flex">
        {NAV.map(item => (
          <button key={item.id} onClick={() => set(item.id)}
            className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-all relative
              ${active === item.id ? "text-brand" : "text-muted hover:text-navy"}`}>
            {item.id === "rescue" ? (
              <>
                <div className={`absolute -top-4 w-12 h-12 rounded-2xl flex items-center justify-center shadow-orange transition-all gradient-rescue-btn`}>
                  <span className="text-xl">⚡</span>
                </div>
                <span className="text-[10px] font-bold mt-4">Rescue</span>
              </>
            ) : (
              <>
                <span className="text-xl leading-none">{item.icon}</span>
                <span className="text-[10px] font-bold">{item.label}</span>
                {item.count && criticalCount > 0 && (
                  <span className="absolute top-1.5 right-[22%] w-4 h-4 text-[9px] font-black bg-brand text-white rounded-full flex items-center justify-center">{criticalCount}</span>
                )}
              </>
            )}
          </button>
        ))}
        <button onClick={onNotif}
          className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 text-muted hover:text-navy relative notif-rel">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className="text-[10px] font-bold">Alerts</span>
        </button>
      </div>
    </nav>
  );
}

// ── ROOT ─────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [notif, setNotif] = useState(false);
  // Show splash only when launched as installed PWA
  const [splash, setSplash] = useState(
    typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches
  );

  // Preload next likely page on hover
  const preload = id => {
    const map = {
      rescue: () => import("@/components/pages/RescuePage"),
      needs:  () => import("@/components/pages/NeedsPage"),
      donate: () => import("@/components/pages/DonatePage"),
      impact: () => import("@/components/pages/ImpactPage"),
      home:   () => import("@/components/pages/HomePage"),
    };
    map[id]?.();
  };

  const setPageAndPreload = id => {
    setPage(id);
    // preload adjacent pages
    const adj = { home: ["rescue","needs"], rescue: ["home","needs"], needs: ["donate"], donate: ["impact"], impact: ["home"] };
    adj[id]?.forEach(preload);
  };

  const PAGES = {
    home:   <HomePage setPage={setPageAndPreload} />,
    rescue: <RescuePage />,
    needs:  <NeedsPage />,
    donate: <DonatePage />,
    impact: <ImpactPage />,
  };

  // Splash: only in standalone PWA, auto-hides after 1.8s
  if (splash) return <SplashScreen onDone={() => setSplash(false)} />;

  return (
    <div className="bg-cream" style={{ minHeight: "100dvh" }}>
      {/* Desktop: stacked layout (topnav + full-width content) */}
      <DesktopNav active={page} set={setPageAndPreload} onNotif={() => setNotif(true)} />

      {/* Desktop ticker below topnav */}
      <div className="hidden lg:block bg-white/80 border-b border-border">
        <Ticker />
      </div>

      {/* Mobile header */}
      <MobileHeader onNotif={() => setNotif(true)} />

      {/* Page content */}
      <main className="overflow-y-auto" style={{ paddingBottom: "5.5rem" }}>
        <div className="max-w-screen-xl mx-auto px-4 lg:px-8 py-6 lg:py-10">
          {PAGES[page] || PAGES.home}
        </div>
      </main>

      <BottomNav active={page} set={setPageAndPreload} onNotif={() => setNotif(true)} />
      <NotifPanel open={notif} onClose={() => setNotif(false)} />
      <InstallBanner />
    </div>
  );
}

