import{fallbackParse}from"@/lib/rules";
const SYS=`Extract donation data from the donor message (English/Hindi/Hinglish/Marathi). Use ONLY facts explicitly stated. Unknown = null. Never invent times, temperature or quantity. Return JSON only: {"items":[string],"meals":number|null,"food_type":"veg"|"nonveg"|null,"prepared_at":"HH:MM 24h"|null,"packed_at":"HH:MM 24h"|null,"temperature_c":number|null,"location":string|null}`;
export async function POST(req){
 const{text}=await req.json();
 try{
  if(process.env.OPENAI_API_KEY){
   const r=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+process.env.OPENAI_API_KEY},
    body:JSON.stringify({model:process.env.OPENAI_MODEL||"gpt-4o-mini",response_format:{type:"json_object"},messages:[{role:"system",content:SYS},{role:"user",content:text}]})});
   const j=await r.json();return Response.json({data:JSON.parse(j.choices[0].message.content),source:"AI (OpenAI)"})}
  if(process.env.GEMINI_API_KEY){
   const m=process.env.GEMINI_MODEL||"gemini-2.0-flash";
   const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${process.env.GEMINI_API_KEY}`,{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({systemInstruction:{parts:[{text:SYS}]},contents:[{parts:[{text}]}],generationConfig:{responseMimeType:"application/json"}})});
   const j=await r.json();return Response.json({data:JSON.parse(j.candidates[0].content.parts[0].text),source:"AI (Gemini)"})}
 }catch(e){}
 return Response.json({data:fallbackParse(text),source:"Basic parser (AI unavailable) — fields verify karo"})}
