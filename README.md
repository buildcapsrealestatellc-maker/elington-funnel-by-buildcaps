<div align="center">

<img src="src/app/opengraph-image.jpg" alt="Berkeley Tower by Ellington at dusk beside Business Bay Metro" width="100%" />

# BERKELEY TOWER &nbsp;·&nbsp; BY ELLINGTON

**A cinematic, AI-powered launch funnel for Grade A offices on Sheikh Zayed Road, Business Bay.**
<br/>Presented by **Buildcaps Real Estate**.

[![Live](https://img.shields.io/badge/LIVE-berkeley--tower--by--ellington.buildcaps.com-2d45ff?style=for-the-badge&labelColor=0d0d0f)](https://berkeley-tower-by-ellington.buildcaps.com)

![Next.js](https://img.shields.io/badge/Next.js_16-0d0d0f?style=flat-square&logo=nextdotjs)
![React](https://img.shields.io/badge/React_19-0d0d0f?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-0d0d0f?style=flat-square&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind_4-0d0d0f?style=flat-square&logo=tailwindcss)
![GSAP](https://img.shields.io/badge/GSAP-0d0d0f?style=flat-square&logo=greensock)
![Supabase](https://img.shields.io/badge/Supabase-0d0d0f?style=flat-square&logo=supabase)
![Resend](https://img.shields.io/badge/Resend-0d0d0f?style=flat-square&logo=resend)
![Vercel](https://img.shields.io/badge/Vercel-0d0d0f?style=flat-square&logo=vercel)
![Tests](https://img.shields.io/badge/tests-53_passing-25d366?style=flat-square)

</div>

---

## 🎬 The idea

The site plays like a **film**. Full-screen depth-camera shots carry the visitor from street level to the crown, cut between clean white chapters. A lift readout tracks the floor you're on, and the thank-you page rides the lift to Level 60.

<div align="center">
<img src="public/email/hero.gif" alt="The lift ride: the floor counter ticks 00 to 60, then the doors part on the tower at dusk" width="560" />
<br/><sub><i>The lift ride, used as the animated hero in every lead email.</i></sub>
</div>

---

## 🧠 Mind map

```mermaid
mindmap
  root((Berkeley Tower funnel))
    Film
      Depth-camera shots
      Lift readout 00 → 60
      Viewfinder HUD
      15 chapters
    Lead magnet
      Brochure 71 pages
      Exit popup
      Thank-you lift ride
    USP
      10-year Golden Visa route
      70/30 payment plan
      Freehold offices
    AI
      Ellis concierge chat
      Behaviour-aware remarks
      SpaceDNA sizing
      Ownership Horizon
    Data
      Shared Supabase
      Rows tagged by funnel
      RLS locked
    Email
      Brochure to lead
      Lead alert to team
      Animated GIF hero
    SEO
      Exact-match subdomain
      JSON-LD graph
      Sitemap and robots
      Share image
```

---

## 🛗 The visitor's journey

```mermaid
flowchart LR
    A([Ad / Search]) --> B[Opening shot<br/>Berkeley Tower]
    B --> C[Chapters<br/>Location · Amenities · Floor plans]
    C --> D{Interested?}
    D -- Brochure --> E[Lead form<br/>name · mobile · email]
    D -- Questions --> F[Ellis<br/>AI concierge]
    D -- Leaving --> G[Exit popup<br/>Free brochure]
    F --> E
    G --> E
    E --> H[[Thank-you<br/>Lift ride to L60]]
    H --> I[📄 Brochure download]
    style A fill:#0d0d0f,color:#fff
    style E fill:#2d45ff,color:#fff
    style H fill:#2d45ff,color:#fff
    style F fill:#e6e9ff,color:#0d0d0f
```

---

## ⚡ What happens when a lead submits

```mermaid
sequenceDiagram
    autonumber
    participant V as Visitor
    participant API as /api/lead
    participant R as Resend
    participant DB as Supabase
    participant T as Team inbox
    V->>API: name · mobile · email · source · UTMs
    API->>API: validate (zod) · score hot/warm/cool
    API->>R: Brochure email → visitor
    R-->>V: "Your Berkeley Tower brochure is here"
    API->>DB: insert lead (funnel = berkeley-tower)
    API->>R: Lead alert → team
    R-->>T: [HOT] New Berkeley Tower lead
    API-->>V: ok → thank-you page
```

---

## 🏗️ Architecture

```mermaid
graph TB
    subgraph Client["🌐 Browser"]
        P[Film page<br/>GSAP · Lenis · Motion]
        N[FilmNav]
        L[Lead forms]
        E[Ellis concierge]
    end
    subgraph Edge["▲ Vercel"]
        S[Static page<br/>Cache Components]
        LA[/api/lead/]
        CA[/api/concierge/]
        QA[/api/quip/]
    end
    subgraph Services["☁️ Services"]
        SB[(Supabase<br/>shared leads DB)]
        RS[Resend]
        AI[AI model]
    end
    P --> S
    L --> LA
    E --> CA
    E --> QA
    LA --> SB
    LA --> RS
    CA --> AI
    QA --> AI
```

---

## 🗄️ One database, every funnel

```mermaid
erDiagram
    FUNNELS ||--o{ LEADS : "tags"
    FUNNELS ||--o{ EVENTS : "tags"
    LEADS ||--o{ EVENTS : "may link"
    FUNNELS {
        text slug PK
        text name
        text domain
    }
    LEADS {
        uuid id PK
        text funnel FK
        text full_name
        text email
        text phone
        text score
        jsonb answers
        jsonb attribution
    }
    EVENTS {
        uuid id PK
        text funnel FK
        text type
        jsonb data
    }
```

Each funnel gets its own view (`leads_berkeley_tower`, `leads_sobha_sanctuary`, …). Row-level security is on; only the server's secret key can read or write.

---

## 📊 Chapter map

| # | Chapter | Level | What it sells |
|:-:|---|:-:|---|
| 01 | Overview | G | 60 storeys · 109 freehold offices |
| 02 | Architecture | 05–60 | Louvered façade, fabric in motion |
| 03 | Location | 14 | 4 min to DIFC, Metro next door |
| 04 | Market | 24 | Business Bay #1 for office sales |
| 05 | Amenities | 32–35 | Co-working, clubhouse, wellness |
| 06 | Technology | 36 | 12 double-deck lifts |
| 07 | Floor plans | 41 | 1,132 sq ft → full floors |
| 08 | Summit | 54–58 | Duplex & triplex HQs |
| 09 | Future | 60 | Vertiport readiness |
| 10 | Payment plan | ★ | 70 / 30 |
| 11 | **Golden Visa** | ★ | **10-year residency route** |
| 12 | AI studio | ★ | SpaceDNA · Ownership Horizon |
| 13 | Developer | ★ | Ellington, design-led since 2014 |
| 14 | Questions | ★ | FAQ + consultant |
| 15 | Register | ★ | Brochure + launch access |

---

## 💰 70/30 payment plan

```mermaid
pie showData
    title Payment schedule (% of price)
    "At booking" : 20
    "First year (4 × 5%)" : 20
    "Construction (6 × 5%)" : 30
    "On completion" : 30
```

---

## 🎨 Design system

| Token | Colour | Use |
|---|---|---|
| `paper` | ![#ffffff](https://img.shields.io/badge/-%23ffffff-ffffff?style=flat-square) | Base |
| `ink` | ![#0d0d0f](https://img.shields.io/badge/-%230d0d0f-0d0d0f?style=flat-square) | Type, dark chapters |
| `mist` | ![#f3f4f6](https://img.shields.io/badge/-%23f3f4f6-f3f4f6?style=flat-square) | Panels, lift doors |
| `accent` | ![#2d45ff](https://img.shields.io/badge/-%232d45ff-2d45ff?style=flat-square) | Electric cobalt |
| `whatsapp` | ![#25d366](https://img.shields.io/badge/-%2325d366-25d366?style=flat-square) | WhatsApp actions |

Type: **Archivo Expanded** for display, **Inter** for text. Signature: one square corner on every card.

---

## 🚀 Run it

```bash
pnpm install
cp .env.example .env.local   # fill in the keys
pnpm dev                     # http://localhost:3000
```

| Command | Does |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm test` | 53 unit tests (Vitest) |
| `pnpm lint` | Biome |
| `node scripts/email-assets.mjs` | Rebuild email images, the lift GIF and the share image |

### Environment

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical address |
| `SUPABASE_URL` · `SUPABASE_SECRET_KEY` · `FUNNEL_SLUG` | Shared leads database |
| `RESEND_API_KEY` · `EMAIL_FROM` · `LEAD_NOTIFY_TO` | Emails |
| `ANTHROPIC_API_KEY` | AI concierge and remarks (offline answers without it) |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Search Console |

---

## 📁 Structure

```
src/
├─ app/            page · API routes · robots · sitemap · share image
├─ components/
│  ├─ film/        shots, chapters, viewfinder
│  ├─ nav/         FilmNav, lift system, mobile bar
│  ├─ lead/        forms, popup, thank-you lift ride
│  ├─ concierge/   Ellis face, chat panel, remarks
│  └─ tools/       SpaceDNA, Ownership Horizon
├─ lib/
│  ├─ data/        tower facts, Golden Visa, broker, FAQ
│  ├─ email/       templates + Resend sender
│  └─ lead/        schema, delivery (Supabase · Resend)
supabase/migrations/   shared Buildcaps database
scripts/               asset pipelines
```

---

<div align="center">
<sub>Renders are illustrative. Prices, areas and dates are indicative until the Sales and Purchase Agreement. Golden Visa approval rests with ICP and the Dubai Land Department.</sub>
<br/><br/>
<b>Buildcaps Real Estate</b> · Conrad Office Tower, Office 1604, Sheikh Zayed Road, Dubai
</div>
