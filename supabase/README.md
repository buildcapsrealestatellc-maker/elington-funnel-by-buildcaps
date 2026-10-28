# Buildcaps shared Supabase

One Supabase project (ref `rmethtjqvfsjijoednbk`) holds the leads of **every** Buildcaps funnel.
This folder owns its schema: no other repo changes it.

## What's in it

| Object | What it is |
| --- | --- |
| `funnels` | The register. Every lead and event names one of these slugs. |
| `leads` | Every lead from every funnel. Shared fields are columns; anything one funnel asks goes in `answers`. |
| `events` | Anything else a funnel records (AI tool use, downloads, quiz steps). |
| `leads_<slug>` | One view per funnel (`leads_berkeley_tower`, `leads_greenz_danube`…), so each funnel reads as its own table in the dashboard. Created, renamed and dropped automatically with its `funnels` row. |

Registered funnels:

| Slug | Funnel |
| --- | --- |
| `berkeley-tower` | Berkeley Tower by Ellington |
| `sobha-sanctuary` | Sobha Sanctuary |
| `shahrukhz-residences` | Shahrukhz Residences by Danube |
| `tilal-binghatti` | Tilal by Binghatti |
| `greenz-danube` | Greenz by Danube |
| `serenz-danube` | Serenz by Danube |

A new funnel needs one row and nothing else; its view appears on insert:

```sql
insert into public.funnels (slug, name, domain, developer)
values ('my-new-funnel', 'My New Funnel', 'my-new-funnel.buildcaps.com', 'Developer');
```

RLS is on with no policies, and `anon` / `authenticated` have no grants: the publishable key can
read or write nothing. Only a funnel's server, holding the secret key, can.

## Connect a funnel

Server-side environment variables (local `.env.local` and the funnel's Vercel project, Production and Preview):

| Variable | Value |
| --- | --- |
| `SUPABASE_URL` | Same for every funnel. |
| `SUPABASE_SECRET_KEY` | Same for every funnel (`sb_secret_…`). Server only: never `NEXT_PUBLIC_`, never sent to the browser. |
| `LEAD_IP_SALT` | Same for every funnel, so one visitor's `ip_hash` matches across funnels. |
| `FUNNEL_SLUG` | This funnel's slug from the table above. |

The values live in Berkeley's `.env.local` and its Vercel project. `SUPABASE_DB_URL` (the database
password) stays on this machine for running migrations; funnels don't need it.

The secret key goes in the `apikey` header only. It isn't a JWT, so don't send it as `Authorization: Bearer`.
`@supabase/supabase-js` with the secret key works too, if a funnel already uses it.

## Writing a lead

`POST {SUPABASE_URL}/rest/v1/leads` with one JSON row:

| Column | What goes in it |
| --- | --- |
| `funnel` | `FUNNEL_SLUG`. Required. |
| `full_name` | Required. |
| `email` | Trimmed. |
| `phone` | E.164, e.g. `+971501234567`. |
| `country` | ISO 3166 alpha-2 from the phone number (`AE`, `IN`, `GB`). |
| `language` | `en`, `ar`, `ru`… |
| `offer` | What they asked for: `brochure`, `access`, `price-list`, `priority-pass`… |
| `source` | The button or form that opened it: `header`, `hero`, `popup`, `chat`… |
| `score` | `hot` / `warm` / `cool`. |
| `consent` | `true` only when they ticked the contact consent. |
| `marketing_opt_in` | `true` only when they ticked marketing. |
| `answers` | jsonb: this funnel's own questions (purpose, size, budget, timeline, unit…), snake_case keys. |
| `attribution` | jsonb: `utm_*`, `gclid`, `gbraid`, `wbraid`, `fbclid`, `ttclid`, `li_fat_id`, `referrer`, `landing`. |
| `page_url` | The page the form was on. |
| `ip_hash` | `sha256("<LEAD_IP_SALT>:<ip>")` as hex. Never the raw IP. |
| `user_agent` | Up to 300 characters. |
| `brochure_emailed` | `true` / `false` when the funnel emails a brochure, otherwise leave null. |
| `id`, `created_at` | Optional. Pass your own `id` (uuid) to reference the lead in emails and events. |
| `status`, `notes` | Leave them; the team edits them in the dashboard. `updated_at` follows automatically. |
| `legacy_id` | Imports only (below). |

The reference implementation is `supabaseSink` in `src/lib/lead/server.ts`. A minimal one for any Node server:

```ts
import { createHash } from "node:crypto";

export async function saveLead(row: Record<string, unknown>, ip?: string) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return { ok: false, error: "Supabase not configured" };
  const ip_hash = ip
    ? createHash("sha256").update(`${process.env.LEAD_IP_SALT ?? ""}:${ip}`).digest("hex")
    : null;
  const res = await fetch(`${url}/rest/v1/leads`, {
    method: "POST",
    headers: { apikey: key, "content-type": "application/json", prefer: "return=minimal" },
    body: JSON.stringify({ ...row, funnel: process.env.FUNNEL_SLUG, ip_hash }),
    signal: AbortSignal.timeout(8000),
  });
  return res.ok ? { ok: true } : { ok: false, error: `HTTP ${res.status} ${await res.text()}` };
}
```

Keep a second delivery path (the team's email alert, a CRM webhook) beside Supabase, and tell the
visitor it worked when any path succeeded, so one outage never loses a lead.

## Writing an event

`POST {SUPABASE_URL}/rest/v1/events` with `{ funnel, type, lead_id?, session_id?, data }`.
`type` is snake_case (`brochure_download`, `chat_message`, `tool_used`); `data` is any jsonb.

## Importing an old funnel's leads

Copy them in with their original ids and times, so the import can run again without duplicates:

- `legacy_id`: the lead's id in the old database, as text.
- `created_at`: the original timestamp.
- Map old fields onto the columns above; everything else goes in `answers`.
- Post batches of up to 500 to `{SUPABASE_URL}/rest/v1/leads?on_conflict=funnel,legacy_id` with
  `Prefer: return=minimal,resolution=ignore-duplicates`. Rows already copied are skipped.
- Every object in a batch needs the same keys. Use `null` for a missing value, except `consent` and
  `marketing_opt_in` (`false`) and `answers` / `attribution` (`{}`).
- Check that the count in `leads_<slug>` matches the old table before switching the old database off.

## Changing the schema

Only in this folder, as the next numbered file. Shared columns serve every funnel; anything one
funnel needs goes in `answers`. Apply with:

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -1 -f supabase/migrations/0003_name.sql
```

Applied so far: `0001_shared_funnels.sql` (2026-10-25), `0002_finalize_shared_funnels.sql` (2026-10-28).
