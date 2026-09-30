"use client";
import { useState } from "react";
import { NGOS } from "@/lib/ngos";
import { Badge, Button, ProgressBar } from "@/components/ui";

const AMOUNTS = [100, 250, 500, 1000];

export default function DonatePage() {
  const [donated, setDonated] = useState(null);

  if (donated) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-5 anim-slide-up">
      <div className="w-24 h-24 bg-ok rounded-3xl flex items-center justify-center text-white text-5xl">✓</div>
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
        <h1 className="text-2xl lg:text-3xl font-black text-navy">Support an NGO</h1>
        <p className="text-sm text-muted mt-1">Contribute funds to community organizations.</p>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-2 items-center text-sm text-amber-700 font-medium">
        ℹ️ Demo mode — no real payment processed.
      </div>
      <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
        {NGOS.slice(0, 6).map(n => {
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
