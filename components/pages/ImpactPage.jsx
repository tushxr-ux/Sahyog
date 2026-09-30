"use client";
import { DEMO_USER, CONTRIBUTION_HISTORY } from "@/lib/demo";
import { Badge, CountUp, Button, ProgressBar } from "@/components/ui";

// ponytail: StatCard inlined — only used here, no shared need
function Stat({ label, value, gradient, icon }) {
  return (
    <div className={`rounded-2xl p-4 text-white ${gradient}`}>
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-2xl font-black">{value}</div>
      <div className="text-[11px] font-semibold opacity-70 mt-0.5 uppercase tracking-wide">{label}</div>
    </div>
  );
}

export default function ImpactPage() {
  return (
    <div className="space-y-8 anim-fade-in">
      {/* Header */}
      <div className="hero-band p-6 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-brand/6 rounded-full" />
        <div className="relative">
          <div className="text-sm font-bold text-brand">Your SAHYOG Impact</div>
          <div className="text-2xl lg:text-3xl font-black text-navy mt-1">Tushar Salunkhe</div>
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Badge variant="brand">⭐ Active Contributor</Badge>
            <Badge variant="success">🍽 Food Rescuer</Badge>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Meals Supported" icon="🍽️" gradient="bg-brand" value={<CountUp target={DEMO_USER.mealsSupported} />} />
        <Stat label="Needs Fulfilled" icon="✅" gradient="bg-ok"    value={<CountUp target={DEMO_USER.needsFulfilled} />} />
        <Stat label="Items Donated"   icon="📦" gradient="bg-blue"  value={<CountUp target={DEMO_USER.itemsDonated} />} />
        <Stat label="Contributed"     icon="💰" gradient="bg-navy"  value={`₹${DEMO_USER.contributed.toLocaleString("en-IN")}`} />
      </div>

      {/* History */}
      <div>
        <h2 className="text-xs font-black text-muted uppercase tracking-widest mb-3">Contribution History</h2>
        <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
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
                <div className="text-xs text-muted mt-1">{c.meals ? `${c.meals} meals` : c.amount ? `₹${c.amount}` : c.item}</div>
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-4 bg-white/8 rounded-xl p-3">
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
