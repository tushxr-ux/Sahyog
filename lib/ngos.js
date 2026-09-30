import{PROFILES}from"./profiles";
// Real NGO names + areas: BMC "NGO Directory 2025" (mcgm.gov.in) and Sulekha (Sadadevi).
// needToday / pickup / reliability are DEMO ESTIMATES, NOT NGO-declared. Confirm before claiming "real pilot".
// z = rough zone key used for approximate ETA (see lib/rules.js ZONES).
const R=[ // [name, area, z, type, needToday, pickup, food]
["Sadadevi Foundation","Kandivali West","kandivali","Old age home",60,"own","vn"],
["Child Vision and Education","Dahisar East","dahisar","Orphanage / old age home",90,"own","v"],
["Abhilasha Foundation","Gorai, Borivali West","gorai","Orphanage / old age home",70,"none","v"],
["Prayatna","Orlem, Malad West","malad","Free food distribution",150,"volunteer","vn"],
["Compassion Charitable Trust","Malwani, Malad West","malwani","Orphanage",80,"own","vn"],
["Swagat Ashram","Malvani, Malad West","malwani","Orphanage / shelter",60,"none","v"],
["Community Development Center","Malad West","malad","Feeding programme",120,"volunteer","vn"],
["Little Angel Ashram","Madh","madh","Orphanage",50,"none","v"],
["Tweet Foundation","Goregaon West","goregaon","Shelter homes",70,"own","vn"],
["Rangoonwala Foundation India Trust","Andheri West","andheri","Shelter / elderly care",100,"volunteer","vn"],
["The Nest India (Angel Nest)","Marol, Andheri East","marol","Orphanage",80,"own","vn"],
["Ashadeep Association","Chakala, Andheri East","chakala","Orphanage",60,"none","v"],
["SUPPORT (Ansh Community Kitchen)","Santacruz East","santacruz","Street children / community kitchen",200,"volunteer","vn"],
["Vatsalya Trust","Kanjurmarg East","kanjurmarg","Orphanage / old age",75,"own","v"],
["Try Foundation","Sion West","sion","Orphanage / old age",65,"none","v"],
["Shradhanand Mahila Ashram","Matunga East","matunga","Women's shelter",55,"own","v"],
["Community Outreach Programme (Street Children)","Mumbai Central","mumbai central","Street children shelter",110,"volunteer","vn"],
["Bal Asha Trust","Mahalakshmi","mahalakshmi","Children's home",85,"own","vn"],
["Our Children","Tardeo","tardeo","Orphanage",60,"none","v"],
["Asha Sadan","Umerkhadi, Dongri","umerkhadi","Children's shelter",70,"own","vn"],
["Anjuman-E-Mufidulyatama","Madanpura / Nagpada","madanpura","Orphanage / ration",90,"volunteer","vn"],
["Annamitra Foundation","Girgaon Chowpatty","girgaon","Free food distribution",250,"own","v"],
["Anjeze Charitable Trust","Fort","fort","Free food distribution",120,"volunteer","vn"],
["Swanath Foundation","Malabar Hill","malabar","Orphanage",50,"none","v"],
["True Wings Foundation (recovery centre)","Charkop, Kandivali West","charkop","Recovery centre (residents) - my judgment, confirm",30,"none","v"]];
// APPROXIMATE area points (not exact addresses), used only for the map + rough ETA.
export const COORD={kandivali:[19.2047,72.8526],charkop:[19.208,72.834],dahisar:[19.2502,72.8596],gorai:[19.23,72.795],malad:[19.186,72.8485],malwani:[19.19,72.815],madh:[19.14,72.79],goregaon:[19.1645,72.8494],andheri:[19.1197,72.8464],marol:[19.115,72.88],chakala:[19.11,72.865],santacruz:[19.081,72.842],kanjurmarg:[19.13,72.93],sion:[19.039,72.8619],matunga:[19.027,72.857],"mumbai central":[18.969,72.8194],mahalakshmi:[18.9827,72.8236],tardeo:[18.97,72.813],umerkhadi:[18.9613,72.8385],madanpura:[18.965,72.83],girgaon:[18.956,72.809],fort:[18.9339,72.8356],malabar:[18.9548,72.7985]};
// Western line, Kandivali: 3 ahead + 4 behind
export const STATIONS=[["Jogeshwari",19.1361,72.849],["Ram Mandir",19.1546,72.8497],["Goregaon",19.1645,72.8494],["Malad",19.186,72.8485],["Kandivali",19.2047,72.8526],["Borivali",19.2307,72.8567],["Dahisar",19.2502,72.8596],["Mira Road",19.2813,72.8561]].map(([name,a,b])=>({name,c:[a,b]}));
export const NGOS=R.map(([name,area,z,type,needToday,pickup,f],i)=>({id:i+1,name,profile:PROFILES[name]||null,area,z,type,needToday,pickup,lat:(COORD[z]||[19.19,72.85])[0]+((i*37)%11-5)*0.0011,lng:(COORD[z]||[19.19,72.85])[1]+((i*53)%11-5)*0.0011,
 food:f=="v"?["veg"]:["veg","nonveg"],reliability:.6+((i*7)%4)/10,source:"BMC NGO Directory 2025",verified:false}));
