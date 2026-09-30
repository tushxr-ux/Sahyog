"use client";
import { useState } from "react";
import { NGO_NEEDS, ITEM_CATEGORIES } from "@/lib/demo";
import { Button, Badge, Tabs, Toast } from "@/components/ui";

export default function NeedsPage() {
  const [tab, setTab] = useState("needs");
  const [helped, setHelped] = useState({});
  const [toast, setToast] = useState({ visible: false, message: "" });

  const markHelp = id => {
    setHelped(p => ({ ...p, [id]: true }));
    setToast({ visible: true, message: "Marked! A coordinator will be in touch. 🙏" });
    setTimeout(() => setToast(p => ({ ...p, visible: false })), 3000);
  };

  const pStyle = {
    critical: { cls: "card-critical", badge: "critical" },
    high:     { cls: "card-orange",   badge: "warn"     },
    medium:   { cls: "card-blue",     badge: "medium"   },
  };

  return (
    <div className="space-y-6 anim-fade-in">
      <Toast {...toast} />
      <div>
        <h1 className="text-2xl lg:text-3xl font-black text-navy">Community Needs</h1>
        <p className="text-sm text-muted mt-1">What local NGOs need right now.</p>
      </div>

      <Tabs
        tabs={[{ id: "needs", label: "Current Needs" }, { id: "categories", label: "Donate Items" }]}
        active={tab} onChange={setTab} />

      {tab === "needs" && (
        <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
          {NGO_NEEDS.map(n => {
            const p = pStyle[n.priority] || pStyle.medium;
            return (
              <div key={n.id} className={`p-4 space-y-3 card-hover ${p.cls}`}>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-navy">{n.qty} {n.item}</span>
                    <Badge variant={p.badge}>{n.priority}</Badge>
                  </div>
                  <p className="text-xs text-muted mt-0.5">{n.ngoName} · {n.area}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
