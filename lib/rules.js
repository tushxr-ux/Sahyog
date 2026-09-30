export const RESCUE_HOURS=4; // platform rule, NOT a safety certificate
const AREAS=["Kandivali","Thakur Village","Charkop","Mahavir Nagar","Poisar","Borivali","Malad","Dahisar"];
const ZONES={dahisar:13,"mira road":14,"ram mandir":8.5,gorai:12,borivali:12,kandivali:11,charkop:11,"thakur":11,"mahavir nagar":11,poisar:11,malwani:10,madh:10,malad:10,goregaon:9,jogeshwari:8,marol:7,chakala:7,andheri:7,powai:7,kanjurmarg:7.5,vikhroli:7.5,mulund:9,bhandup:8,ghatkopar:6,santacruz:6,kurla:5.5,bandra:5,chembur:5,mahim:4.5,dadar:4,sion:4,matunga:4,parel:3,worli:3,mahalakshmi:2.5,byculla:2.5,"mumbai central":2.5,tardeo:2.5,madanpura:2,umerkhadi:1.5,girgaon:1.5,malabar:1.5,fort:1,colaba:0};
export const zoneKey=t=>{t=(t||"").toLowerCase();return Object.keys(ZONES).find(k=>t.includes(k))||null};
export const zoneOf=t=>{const k=zoneKey(t);return k?ZONES[k]:null};
// approximate ETA (demo estimate): base 8 min + 4 min per zone step
export const etaFor=(loc,z)=>{const a=zoneOf(loc),b=ZONES[z];return a==null||b==null?20:Math.round(8+Math.abs(a-b)*4)};
export const toMin=t=>{if(!t)return null;const[h,m]=t.split(":").map(Number);return h*60+m};
export function fallbackParse(t){
 const m=t.match(/(\d+)\s*(plates?|meals?|log|people|persons?|packets?)/i);
 const tm=t.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
 let prep=null;if(tm){let h=+tm[1]%12;if(tm[3].toLowerCase()=="pm")h+=12;prep=`${String(h).padStart(2,"0")}:${tm[2]||"00"}`}
 return{items:[],meals:m?+m[1]:null,food_type:/non[\s-]?veg/i.test(t)?"nonveg":/\bveg/i.test(t)?"veg":null,
  prepared_at:prep,packed_at:null,temperature_c:null,location:AREAS.find(a=>t.toLowerCase().includes(a.toLowerCase()))||null}}
export function analyze(d,nowMin){
 const missing=[["meals","Quantity"],["food_type","Veg/Non-veg"],["prepared_at","Prepared time"],["location","Location"]].filter(([k])=>!d[k]).map(x=>x[1]);
 const p=toMin(d.prepared_at),k=toMin(d.packed_at),conflicts=[];
 if(p!=null&&k!=null&&((k-p+1440)%1440)>720)conflicts.push("Packed time, prepared time se pehle hai — check karo");
 const age=p==null?null:((nowMin-p+1440)%1440);
 const left=age==null?null:RESCUE_HOURS*60-age;
 const urgency=left==null?"unknown":left<=0?"expired":left<45?"critical":left<90?"high":"medium";
 return{missing,conflicts,left,urgency}}
export function rank(d,left,ngos){
 const ranked=[],rejected=[];
 for(const n of ngos){
  const why=[];const eta=etaFor(d.location,n.z);
  if(!n.food.includes(d.food_type))why.push("Ye food type nahi leta");
  if(n.needToday<=0)why.push("Aaj ki need poori ho chuki");
  if(eta>=left)why.push(`ETA ${eta} min, deadline se pehle nahi pahunch sakta`);
  if(why.length){rejected.push({n,why});continue}
  const fit=Math.min(1,n.needToday/(d.meals||1));
  const pk=n.pickup=="none"?.3:n.pickup=="volunteer"?.6:1;
  const s=.35*(1-eta/left)+.3*fit+.15+.1*pk+.1*n.reliability;
  ranked.push({n,score:Math.round(s*100),reason:`${eta} min ETA · aaj ${n.needToday} meals ki need · pickup: ${n.pickup}`})}
 ranked.sort((a,b)=>b.score-a.score);return{ranked,rejected}}
