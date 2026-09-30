"use client";
import{useState,useEffect}from"react";
import dynamic from"next/dynamic";
import{NGOS,STATIONS,COORD}from"@/lib/ngos";
import{derived,matchContext}from"@/lib/profiles";
import{analyze,rank,zoneKey}from"@/lib/rules";
const MapView=dynamic(()=>import("./MapView"),{ssr:false});
const SAMPLES=[
 "80 plates rice dal paneer bacha hai wedding ke baad Kandivali mein. Veg. Cooked around 10 pm, packed 11:10 pm. Pickup ASAP",
 "kuch khana bacha hai shaadi ka, jaldi uthao",
 "60 meals veg, Thakur Village, cooked 9 pm, packed 8 pm",
 "150 plates non veg biryani Charkop, cooked 11 pm"];
const nowMin=()=>{const n=new Date();return n.getHours()*60+n.getMinutes()};
const UR={medium:"bg-brand",high:"bg-action",critical:"bg-bad",expired:"bg-navy",unknown:"bg-warn"};
function Profile({n,onClose}){const p=n.profile,d=derived(p);
 const rows=[["Type",n.type],["Area",n.area+" (approx. pin, not exact address)"],p&&p.address&&["Address",p.address],p&&p.website&&["Website",p.website],p&&p.phone&&["Phone",p.phone],
  p&&p.beneficiaries&&["Beneficiaries",p.beneficiaries.count+" "+p.beneficiaries.type],d&&["Derived daily meals",d+" (count x "+p.meals_per_day+" meals/day, estimate)"],p&&p.kitchen&&["Kitchen",p.kitchen],
  ["Takes outside cooked food?",(p&&p.outside_food)||"Unconfirmed"],["Need today (used in matching)",n.needToday+" meals - DEMO estimate"],["Pickup",n.pickup]].filter(Boolean);
 const ok=p&&p.confidence=="sourced";
 return<div className="rounded-2xl border-2 border-brand bg-white p-4 text-sm space-y-1"><div className="flex justify-between"><b className="text-base">{n.name}</b><button onClick={onClose}>✕</button></div>
  <span className={"inline-block rounded-full px-2 text-xs text-white "+(ok?"bg-ok":"bg-warn")}>{ok?"Sourced from public pages":"Not yet researched"}</span>
  {p&&p.note&&<p className="text-bad">{p.note}</p>}
  {rows.map(([k,v])=><p key={k}><b>{k}:</b> {v}</p>)}
  {p&&p.programs&&<p><b>Programs:</b> {p.programs.join(", ")}</p>}
  {p&&p.sources&&<div className="text-xs break-all">{p.sources.map(x=><a key={x} href={x} target="_blank" className="block underline">{x}</a>)}</div>}
  <details><summary className="cursor-pointer">AI match context (JSON)</summary><pre className="overflow-x-auto text-xs">{JSON.stringify(matchContext(n),null,1)}</pre></details></div>}
export default function Home(){
 const[sel,setSel]=useState(null);
 const[step,setStep]=useState("compose");const[text,setText]=useState("");const[d,setD]=useState(null);
 const[src,setSrc]=useState("");const[busy,setBusy]=useState(false);const[t,setT]=useState(nowMin());
 const[pub,setPub]=useState(null);const[pick,setPick]=useState(null);const[otp,setOtp]=useState("");const[inp,setInp]=useState("");
 useEffect(()=>{const i=setInterval(()=>setT(nowMin()+new Date().getSeconds()/60),1000);return()=>clearInterval(i)},[]);
 async function parse(){setBusy(true);
  try{const r=await fetch("/api/parse",{method:"POST",body:JSON.stringify({text})});const j=await r.json();setD(j.data);setSrc(j.source)}
  catch{setD({});setSrc("Error — fields khud bharo")}
  setBusy(false);setStep("review")}
 const set=(k,v)=>setD({...d,[k]:v===""?null:v});
 const a=d?analyze(d,t):null;
 const canPub=a&&!a.missing.length&&!a.conflicts.length;
 const live=pub?analyze(pub,t):null;
 const m=pub?rank(pub,live.left??0,NGOS):null;
 const mm=x=>{const s=Math.max(0,Math.round(x*60));return`${Math.floor(s/3600)}:${String(Math.floor(s/60)%60).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`};
 const F=({k,label,type="text"})=><label className="block text-sm font-medium">{label}
  <input type={type} value={d[k]??""} onChange={e=>set(k,type=="number"&&e.target.value?+e.target.value:e.target.value)}
   className={"mt-1 w-full rounded-xl border-2 p-2 "+(d[k]?"border-navy/20":"border-warn bg-warn/10")}/>
  <span className="text-xs text-navy/60">{d[k]?(src.startsWith("AI")?"AI ne nikala · confirm karo":"Aapne bhara"):"Missing — zaroori"}</span></label>;
 return<main className="mx-auto max-w-xl p-4 pb-24">
  <header className="flex items-center gap-3 mb-4"><img src="/logo.png" alt="SAHYOG" className="h-12"/><div><b className="text-2xl">SAHYOG</b><div className="text-xs text-navy/70">Connecting Needs. Creating Impact.</div></div></header>

  {step=="compose"&&<section className="space-y-3">
   <h1 className="text-xl font-bold">Surplus food hai? Bas message likho.</h1>
   <textarea value={text} onChange={e=>setText(e.target.value)} rows={5} placeholder="Jaise: 80 plates rice dal bacha hai, Kandivali, cooked 10 pm..." className="w-full rounded-2xl border-2 border-navy/20 p-3"/>
   <div className="flex flex-wrap gap-2">{SAMPLES.map((s,i)=><button key={i} onClick={()=>setText(s)} className="rounded-full bg-white border px-3 py-1 text-xs text-left">Sample {i+1}</button>)}</div>
   <div><p className="mb-1 text-sm font-medium">NGO network: Jogeshwari → Mira Road (approx. area points)</p><MapView ngos={NGOS} stations={STATIONS} h={260} onPick={setSel}/>{sel&&<Profile n={sel} onClose={()=>setSel(null)}/>}</div>
   <button disabled={!text||busy} onClick={parse} className="w-full rounded-2xl bg-action py-3 text-lg font-bold text-white disabled:opacity-40">{busy?"Message samajh raha hoon…":"Create Listing"}</button>
   <button onClick={()=>{setD({});setSrc("Manual");setStep("review")}} className="text-sm underline">AI ke bina manually bharo</button></section>}

  {step=="review"&&d&&<section className="space-y-3">
   <h2 className="text-lg font-bold">Review karo</h2><p className="text-xs">Source: {src}</p>
   <div className="grid grid-cols-2 gap-3"><F k="meals" label="Meals / plates" type="number"/>
    <label className="block text-sm font-medium">Food type<select value={d.food_type??""} onChange={e=>set("food_type",e.target.value)} className={"mt-1 w-full rounded-xl border-2 p-2 "+(d.food_type?"border-navy/20":"border-warn bg-warn/10")}><option value="">Select</option><option value="veg">Veg</option><option value="nonveg">Non-veg</option></select></label>
    <F k="prepared_at" label="Prepared at" type="time"/><F k="packed_at" label="Packed at (optional)" type="time"/>
    <F k="location" label="Location"/><F k="temperature_c" label="Temp °C (optional)" type="number"/></div>
   {a.missing.length>0&&<p className="rounded-xl bg-warn/20 p-3 text-sm">⚠ Missing: {a.missing.join(", ")}. Inhe bharo, phir publish hoga.</p>}
   {a.conflicts.map(c=><p key={c} className="rounded-xl bg-bad/15 p-3 text-sm text-bad">✖ {c}</p>)}
   <p className="text-xs text-navy/60">Deadline ek platform rule hai (prepared se 4 ghante), food safety certificate nahi.</p>
   <button disabled={!canPub} onClick={()=>{setPub(d);setStep("live")}} className="w-full rounded-2xl bg-action py-3 font-bold text-white disabled:opacity-40">Publish & find NGOs</button>
   <button onClick={()=>setStep("compose")} className="text-sm underline">← Back</button></section>}

  {step=="live"&&pub&&<section className="space-y-3">
   <div className={"rounded-2xl p-4 text-white "+UR[live.urgency]}><div className="text-sm">Rescue window · {live.urgency}</div>
    <div className="text-4xl font-bold tabular-nums">{live.left==null?"--":mm(live.left)}</div>
    <div className="text-sm">{pub.meals} meals · {pub.food_type} · {pub.location}</div></div>
   <MapView ngos={NGOS} stations={STATIONS} donor={COORD[zoneKey(pub.location)]} hi={m.ranked.slice(0,3).map(r=>r.n.id)} h={260} onPick={setSel}/>{sel&&<Profile n={sel} onClose={()=>setSel(null)}/>}
   {live.left<=0?<div className="rounded-2xl bg-white p-4 border-2 border-bad"><b>Expired</b><p className="text-sm">Ab human-food matching band. Fallback: animal feed / compost partner se contact karo.</p></div>
   :pick?<div className="grid gap-3 sm:grid-cols-2">
     <div className="rounded-2xl bg-white p-4 border"><b>Donor screen</b><p className="text-sm">{pick.n.name} ne accept kiya. Pickup OTP:</p><div className="text-3xl font-bold tracking-widest text-brand">{otp}</div></div>
     <div className="rounded-2xl bg-white p-4 border"><b>NGO screen</b>
      {inp=="ok"?<p className="mt-2 font-bold text-ok">✔ Delivered — {pub.meals} meals rescued</p>:<>
       <input value={inp} onChange={e=>setInp(e.target.value)} placeholder="OTP daalo" className="mt-2 w-full rounded-xl border-2 p-2"/>
       <button onClick={()=>inp==otp&&setInp("ok")} className="mt-2 w-full rounded-xl bg-ok py-2 font-bold text-white">Confirm handover</button></>}</div></div>
   :<>
    <h2 className="font-bold">Best matches</h2>
    {m.ranked.length==0&&<p className="rounded-xl bg-warn/20 p-3 text-sm">Koi eligible NGO nahi mila. Radius badhao ya volunteers se escalate karo.</p>}
    {m.ranked.slice(0,3).map(({n,score,reason})=><div key={n.id} className="rounded-2xl bg-white p-4 border">
     <div className="flex justify-between"><b>{n.name}</b><span className="font-bold text-brand">{score}</span></div>
     <div className="text-xs text-navy/60">{n.area} · {n.type} · needs = demo estimate</div>
     <div className="my-2 h-2 rounded bg-navy/10"><div className="h-2 rounded bg-brand" style={{width:score+"%"}}/></div>
     <p className="text-sm">{reason}</p>
     <button onClick={()=>{setPick({n});setOtp(String(1000+Math.floor(Math.random()*9000)))}} className="mt-2 w-full rounded-xl bg-action py-2 font-bold text-white">NGO accepts</button></div>)}
    {m.rejected.length>0&&<details className="text-sm"><summary>Kyun nahi baaki NGOs ({m.rejected.length})</summary>{m.rejected.map(({n,why})=><p key={n.id} className="mt-1"><b>{n.name}:</b> {why.join(", ")}</p>)}</details>}</>}
   <button onClick={()=>{setStep("compose");setText("");setD(null);setPub(null);setPick(null);setInp("")}} className="text-sm underline">New listing</button></section>}
 </main>}
