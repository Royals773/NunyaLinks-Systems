# NunyaLink Systems — Marketing Site

The NunyaLink Systems homepage: a Next.js (App Router) + TypeScript +
Tailwind CSS marketing site with a lead-capture "Automation Audit" form
that emails submissions via [Resend](https://resend.com).

## Stack

- Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- `lucide-react` for icons
- `resend` for transactional email
- No other runtime dependencies

## Project structure

```
app/
  page.tsx              Homepage — assembles all sections
  layout.tsx             Root layout, metadata, JSON-LD
  api/audit/route.ts     Audit form submission handler (sends email)
  icon.tsx / apple-icon.tsx   Generated favicon / app icon
  opengraph-image.tsx    Generated OG image
  robots.ts / sitemap.ts SEO files
  not-found.tsx / error.tsx   Error/edge states
components/               One component per homepage section
lib/audit.ts               Shared types, option lists, validation/sanitization
```

## Running locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the env template and fill in real values (see below):

   ```bash
   cp .env.example .env.local
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

`.env.local` is gitignored — never commit it.

## Environment variables

| Variable | Required | What it's for |
|---|---|---|
| `RESEND_API_KEY` | Yes, to send email | API key from your [Resend](https://resend.com) account. Without it the form still validates and submits, but the send step returns a graceful error. |
| `AUDIT_FROM_EMAIL` | Yes, to send email | The "from" address for both the lead notification and the submitter's confirmation email. Must be on a domain you've verified in Resend (e.g. `audits@nunyalink.com`). |
| `AUDIT_TO_EMAIL` | Yes, to send email | The inbox that receives new audit-request leads. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | The canonical production URL (e.g. `https://nunyalink.com`, no trailing slash). Used for `metadataBase`, Open Graph/Twitter tags, `robots.txt`, and the sitemap. Falls back to `http://localhost:3000` if unset. |

## Build

```bash
npm run build
npm run lint
```

Both should complete with zero errors before deploying.

## Deploying

The project is designed for [Vercel](https://vercel.com) (zero-config
Next.js hosting). In short: push to GitHub, import the repo into Vercel,
set the environment variables above in the project settings, and deploy.
See the deployment checklist provided alongside this project for the
full step-by-step (domain setup, Resend domain verification, and a
post-deploy smoke test).
