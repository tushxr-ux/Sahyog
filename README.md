# SAHYOG — Connecting Needs. Creating Impact.
Surplus-food message -> AI structured listing -> checks -> deadline-aware NGO match -> accept -> OTP handover.

## Run
Prereqs: Node 18+
```
npm install
cp .env.example .env.local   # add OPENAI_API_KEY or GEMINI_API_KEY (optional)
npm run dev                  # http://localhost:3000
```
Deploy: push to GitHub, import in Vercel, add the env var(s).

## How it works
- `app/api/parse` — LLM extracts only what the donor said (unknown = null). No key / AI failure -> basic regex parser + manual form, app never crashes.
- `lib/rules.js` — deterministic rules: missing fields, conflicting times, deadline (RESCUE_HOURS=4, a platform rule, not a safety certificate), urgency, NGO ranking with rejection reasons.
- `lib/ngos.js` — NGO data. 24 real NGO names (BMC NGO Directory 2025). Needs and ETA are demo estimates — confirm with NGOs before any real claim.

## Edge cases handled
Vague message · conflicting times · critical urgency · expired · no eligible NGO.

## Not built yet
Live GPS tracking, Supabase persistence, NGO profile forms, auto-escalation, citizen support page.

## Map
Leaflet + OpenStreetMap (needs internet for tiles). NGO pins are APPROXIMATE area points, not exact addresses.

## NGO profiles
lib/profiles.js holds researched facts (sources listed). Only 1 NGO fully researched so far; others show 'Not yet researched'. matchContext(n) gives a compact JSON you can pass to an LLM for tie-breaking.
