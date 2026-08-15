# Smart Land — AI Digital Audit Platform

Smart Land is a **presentation / analysis interface for REAL data**. It audits
websites and social accounts (Facebook, Instagram, TikTok, YouTube, LinkedIn,
Snapchat) by extracting **real, verified data** from each platform's official
source. It never invents numbers — anything that cannot be verified is shown
transparently as *"not available from the source."*

## Core principle (non-negotiable)

> Every number shown to the user is either:
> (a) pulled directly from an official source, or
> (b) computed mathematically from real source data.
> Otherwise it is reported as *unavailable / API failure / missing permissions*.
> No mock data, no hardcoded scores, no fake fallbacks. Ever.

## Tech stack

- **Next.js 14** (App Router) + **React 18** + TypeScript (strict)
- Tailwind CSS + Framer Motion + Recharts
- i18n (Arabic RTL + English), PWA (manifest + service worker)
- jsPDF / html2canvas (report export), sonner, zod
- Paymob (Accept API) for payments — TEST/SANDBOX mode by default

## Getting started

```bash
npm install
npm run dev
```

- Website: `http://localhost:3000`
- Admin: `/admin` (requires `ADMIN_PASSWORD` env)

## Commands

```bash
npm run lint      # ESLint
npx tsc --noEmit  # type check
npm run build     # production build
npm start         # serve the production build
```

## Environment variables

See **`docs/LAUNCH_HANDOVER.md` §3** for the full, required list. Key ones:

| Var | Purpose |
|-----|---------|
| `NEXT_PUBLIC_SITE_URL` | Final public domain (feeds sitemap/robots/referral/webhooks) |
| `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET` | Admin auth (rotate passwords before launch) |
| `PAYMOB_MODE`, `PAYMOB_SECRET_KEY`, `PAYMOB_PUBLIC_KEY`, `PAYMOB_INTEGRATION_ID`, `PAYMOB_IFRAME_ID`, `PAYMOB_HMAC_SECRET`, `PAYMOB_CUSTOMER_SECRET` | Paymob payments (start with `PAYMOB_MODE=test`) |
| `GEMINI_API_KEY` / `GOOGLE_API_KEY` | Gemini AI + YouTube Data API (optional) |

## Analyzers & data sources

| Type | Source used |
|------|-------------|
| Website | Live DOM/header/HTTP inspection (SSRF-protected) |
| YouTube | Official YouTube Data API v3 + page |
| TikTok / Instagram / Facebook / LinkedIn / Snapchat | Official/public web endpoints + page JSON (no mock) |

## Documentation

- **`docs/LAUNCH_HANDOVER.md`** — the complete pre-launch runbook (env vars,
  verification commands, marketing checklist, per-platform data reality,
  known blockers, and how to finish the launch).