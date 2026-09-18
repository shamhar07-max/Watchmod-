# UAEPCS Digital Ecosystem

Internal operations dashboard, sales/lead workflow engine, and public marketing
site for UAEPCS (Dubai-based IT retail, wholesale & export — networking
equipment, hardware, consumables and corporate IT infrastructure).

Single Next.js app, self-hosted on the client's own server:

- **Public website** (`/`, `/about`, `/products`, `/wholesale-export`,
  `/contact`) — the lead capture form on `/contact` posts to `/api/leads`.
- **Internal dashboard** (`/admin/*`) — staff login, pipeline (Kanban) view,
  leads list & detail with activity timeline, tasks, integrations status.
- **Workflow engine** (`src/lib/workflow.ts`) — enforces valid lead stage
  transitions (`NEW → CONTACTED → QUALIFIED → QUOTED → NEGOTIATION →
  WON/LOST`), logs every change to the activity timeline, and auto-creates
  the next follow-up task.
- **Lead ingestion API** — one public endpoint (`/api/leads`) for the website
  form, plus authenticated webhook endpoints per external channel so leads
  from social/ad platforms land in the same pipeline as website enquiries.

## Tech stack

Next.js 16 (App Router, TypeScript) · Prisma 6 · PostgreSQL · NextAuth
(credentials, JWT sessions) · Tailwind CSS. Everything runs in one container
plus a Postgres container — no external/cloud services required.

## Local development

```bash
cp .env.example .env      # fill in DATABASE_URL and AUTH_SECRET at minimum
npm install
npm run db:migrate        # applies prisma/migrations against DATABASE_URL
npm run db:seed           # creates demo staff logins + sample leads
npm run dev
```

Seeded logins (**change these passwords before going live**):

| Role  | Email             | Password       |
| ----- | ----------------- | -------------- |
| Admin | admin@uaepcs.com  | ChangeMe123!   |
| Sales | sales@uaepcs.com  | ChangeMe123!   |

## Self-hosting on the client's server (Docker)

```bash
cp .env.example .env
# set POSTGRES_PASSWORD and AUTH_SECRET (openssl rand -base64 32) at minimum
docker compose up -d --build
docker compose exec app npx prisma migrate deploy
docker compose exec app npm run db:seed   # first run only
```

The app listens on port 3000 (`docker-compose.yml` maps `3000:3000`). Put it
behind whatever reverse proxy / TLS termination (nginx, Caddy, Traefik) the
server already uses, or expose it directly on the LAN if it's staying
internal-only.

To update after a code change: `git pull && docker compose up -d --build &&
docker compose exec app npx prisma migrate deploy`.

## Connecting external lead sources

Every channel writes into the same `Lead` table via
`src/lib/webhookIngest.ts`, so a Facebook DM, a WhatsApp message and a
website form submission all show up in the same pipeline with a `source`
tag. Configure via `.env` (see `.env.example`) and the corresponding
platform's developer console:

| Channel   | Endpoint                     | How it authenticates              | Setup needed |
| --------- | ----------------------------- | ---------------------------------- | ------------ |
| Website   | `POST /api/leads`             | none (public form)                 | Already live |
| Facebook  | `/api/webhooks/facebook`      | Meta `X-Hub-Signature-256`         | Create a Meta App, subscribe the Page's `leadgen` webhook field, set `FACEBOOK_WEBHOOK_VERIFY_TOKEN` / `FACEBOOK_APP_SECRET`. Lead Ads webhooks only carry a `leadgen_id` — resolving the actual submitted fields needs a follow-up Graph API call with a Page access token (not yet wired up; the lead is created as a placeholder for now so nothing is lost). |
| Instagram | `/api/webhooks/instagram`     | Meta `X-Hub-Signature-256`         | Same Meta App as Facebook, subscribe Instagram Messaging webhooks. |
| WhatsApp  | `/api/webhooks/whatsapp`      | Meta `X-Hub-Signature-256`         | WhatsApp Cloud API (Meta Business), subscribe `messages` webhook field. |
| LinkedIn  | `/api/webhooks/linkedin`      | `x-api-key` header                 | LinkedIn Lead Gen Forms don't push webhooks directly — bridge via Zapier/Make/n8n (or the LinkedIn Lead Sync API if you have partner access) posting the normalized payload here. |
| Other     | `/api/webhooks/generic`       | `x-api-key` header                 | Trade-show scanners, an ERP, email-parsing rules, or any Zapier/Make/n8n flow. |

The `/admin/settings/integrations` page tracks which channels are enabled
and when each last received an event — it doesn't store secrets (those stay
server-side in `.env`).

## Data model

See `prisma/schema.prisma`. Core entities: `User` (staff), `Lead` (the
pipeline), `LeadActivity` (timeline/audit trail), `Task` (follow-ups),
`Customer` (converted leads), `Product` (basic catalogue), and
`IntegrationSource` (per-channel status).

## What's next

This covers the operational backbone end to end — capture, triage, workflow,
tasks, staff dashboard, self-hosted deploy. Natural next additions as the
business needs them: converting won leads into `Customer` + order records,
email/WhatsApp reply templates sent from inside a lead, role-based
permissions beyond Admin/Sales/Support, and the Facebook Graph API
field-data lookup noted above.
