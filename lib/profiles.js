// Researched NGO profiles. Only facts found on public pages; everything else stays null/"unresearched".
// Add more entries keyed by the exact NGO name in lib/ngos.js.
export const PROFILES={
 "Bal Asha Trust":{website:"https://www.balashatrust.org",phone:"022-24944090",
  address:"Anand Niketan, KGVM, Dr. E. Moses Road, Mahalaxmi",
  beneficiaries:{count:113,type:"children (age 1 day to 18 yrs) living in the home",note:"2023 figure; other pages report 107-117"},
  meals_per_day:4,kitchen:"Own kitchens; cooks its own meals",
  programs:["Children's home","Child Development Centre","Poshan nutrition programme (432 children supported)"],
  outside_food:"Unconfirmed - has own kitchen, ask before sending cooked food",confidence:"sourced",
  sources:["https://unitedwaymumbai.org/tmm/view-ngo-117","https://every.org/balashatrust","https://discover.give.do/TE7/bal-asha-trust/"]},
 "Annamitra Foundation":{confidence:"unresearched",
  note:"Name is similar to Annamrita Foundation (Tardeo, annamrita.org, large mid-day-meal kitchens). Not confirmed to be the same entity - verify before using."}
};
export const derived=p=>p&&p.beneficiaries&&p.meals_per_day?p.beneficiaries.count*p.meals_per_day:null;
// compact, honest context you can hand to an LLM for tie-breaking / explanations
export const matchContext=n=>{const p=n.profile||{};return{id:n.id,name:n.name,type:n.type,area:n.area,zone:n.z,pickup:n.pickup,
 needToday_demo_estimate:n.needToday,beneficiaries:p.beneficiaries?p.beneficiaries.count:null,derived_daily_meals:derived(p),
 kitchen:p.kitchen||null,takes_outside_cooked_food:p.outside_food||"unconfirmed",data_confidence:p.confidence||"unresearched"}};
