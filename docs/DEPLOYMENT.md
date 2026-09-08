# Production Deployment Guide (Cloudflare Workers & OpenNext)

This document details the step-by-step procedures for deploying **`commerce-engine`** (iGotThrift) to **Cloudflare Workers** using **OpenNext**, **Cloudflare D1** (SQL Database), and **Cloudflare R2** (Media Storage).

---

## 1. Active Production Infrastructure

- **Frontend & Edge Engine:** Cloudflare Workers via OpenNext (`@opennextjs/cloudflare`)
- **Runtime:** Node.js Compatibility Layer on Cloudflare Workers
- **Database Engine:** Cloudflare D1 (`igotthrift-db`, ID: `0d01bcf7-3cb7-495f-9eb1-ca63b6523208`)
- **Media Storage:** Cloudflare R2 Bucket (`igotthrift-media`)
- **Public Domains & DNS:** Cloudflare DNS (Registrar: GoDaddy; Nameservers: `angela.ns.cloudflare.com`, `sage.ns.cloudflare.com`)
  - Storefront: `https://igotthrift.in`
  - Canonical Redirect: `https://www.igotthrift.in` -> `https://igotthrift.in`
  - Merchant Portal: `https://admin.igotthrift.in`
  - R2 Media CDN: `https://assets.igotthrift.in`
  - Rollback / Preview Worker URL: `https://igotthrift.igotthrift-domain.workers.dev`

> [!NOTE]  
> **Legacy Fallback Infrastructure:** Supabase (PostgreSQL, Auth, Storage) and Vercel hosting are retained as dormant backup infrastructure and MUST remain untouched unless an emergency fallback is triggered.

---

## 2. Configuration Files & Bindings

### Worker & OpenNext Configuration (`wrangler.jsonc`)
```jsonc
{
  "name": "igotthrift",
  "main": ".open-next/worker.js",
  "compatibility_date": "2024-09-23",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "igotthrift-db",
      "database_id": "0d01bcf7-3cb7-495f-9eb1-ca63b6523208"
    }
  ],
  "r2_buckets": [
    {
      "binding": "MEDIA_BUCKET",
      "bucket_name": "igotthrift-media"
    }
  ],
  "vars": {
    "NEXT_PUBLIC_R2_PUBLIC_URL": "https://assets.igotthrift.in",
    "NEXT_PUBLIC_DEFAULT_STORE_SLUG": "igotthrift"
  }
}
```

### Environment Secrets
Set production worker secrets using Cloudflare Wrangler CLI:
```bash
npx wrangler secret put SESSION_SECRET
```

---

## 3. Database & Schema Initialization (Cloudflare D1)

### A. Local Database Setup (Development)
```bash
# Apply schema to local D1 database
npx wrangler d1 execute igotthrift-db --local --file=d1/schema.sql

# (Optional) Seed local development data
npx wrangler d1 execute igotthrift-db --local --file=d1/seed.sql
```

### B. Remote Database Migrations (Production)
```bash
# Apply initial schema to remote production D1
npx wrangler d1 execute igotthrift-db --remote --file=d1/schema.sql

# Apply wrangler migrations
npx wrangler d1 migrations apply igotthrift-db --remote
```

---

## 4. R2 Custom Media Domain Setup

1. In Cloudflare Dashboard, navigate to **R2 → Bucket `igotthrift-media` → Settings → Custom Domains**.
2. Connect custom domain `assets.igotthrift.in`.
3. Cloudflare automatically provisions SSL/TLS certificates and maps DNS for `assets.igotthrift.in`.
4. Verify R2 public access by querying `https://assets.igotthrift.in`.

---

## 5. Production Deployment Steps

### Manual Deployment Workflow
1. Verify TypeScript, Linting, and Production Build:
   ```bash
   npx tsc --noEmit
   npm run lint
   npm run build
   ```
2. Build OpenNext adapter bundle:
   ```bash
   npx @opennextjs/cloudflare
   ```
3. Deploy to Cloudflare Workers:
   ```bash
   npx wrangler deploy
   ```

*Note: Automated GitHub Actions CI/CD deployment pipeline is currently marked as pending implementation.*

---

## 6. Custom Domain & DNS Cutover (GoDaddy → Cloudflare)

- **Registrar:** GoDaddy (`igotthrift.in`)
- **Authoritative Nameservers:**
  - `angela.ns.cloudflare.com`
  - `sage.ns.cloudflare.com`
- **DNS Record Mapping in Cloudflare Zone:**
  - Apex `igotthrift.in`: Worker route binding (`igotthrift.in/*`)
  - `www.igotthrift.in`: Worker route binding (`www.igotthrift.in/*`) with 301 canonical redirect in `proxy.ts`
  - `admin.igotthrift.in`: Worker route binding (`admin.igotthrift.in/*`)
  - `assets.igotthrift.in`: R2 bucket custom domain mapping
  - `_dmarc`: TXT record preserved (`v=DMARC1; p=none;`)

---

## 7. Rollback Procedure

Should an issue arise on custom domain routes:
1. The Cloudflare Workers fallback endpoint `https://igotthrift.igotthrift-domain.workers.dev` remains permanently accessible for isolated verification.
2. Previous deployment versions can be rolled back instantly via Cloudflare Dashboard under **Workers & Pages → `igotthrift` → Deployments → Rollback**.
