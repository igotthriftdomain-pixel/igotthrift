# Production Deployment Guide (Vercel & Supabase)

This document details the step-by-step procedures for deploying **`commerce-engine`** to Vercel and linking it to a production Supabase project.

---

## 1. Deployment Requirements & Platform Compatibility

- **Frontend Platform:** Vercel (recommended)
- **Node.js Runtime:** 20.x
- **Build Engine:** Next.js 16 App Router (Turbopack)
- **Database Backend:** Supabase (PostgreSQL with RLS + Storage)

---

## 2. Environment Variables Configuration

Set the following environment variables in Vercel Dashboard (**Project Settings → Environment Variables**):

| Variable Name | Required | Target Environments | Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Production, Preview, Development | Public URL of the client's Supabase project (e.g. `https://ref.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Production, Preview, Development | Public anon key for browser and SSR client calls |
| `NEXT_PUBLIC_DEFAULT_STORE_SLUG` | **Yes** | Production, Preview, Development | Slug of the default storefront to resolve at root `/` route (e.g. `client-slug`) |

> [!WARNING]  
> Never expose `SUPABASE_SERVICE_ROLE_KEY` in environment variables or client-side code. `commerce-engine` relies entirely on `@supabase/ssr` with anon keys and PostgreSQL RLS for security.

---

## 3. Vercel Project Creation & Deployment

### Step 1: Import Project
1. Log in to your [Vercel Account](https://vercel.com).
2. Click **Add New... → Project**.
3. Select the client's GitHub repository.

### Step 2: Configure Project Settings
- **Framework Preset:** Next.js (automatically detected)
- **Root Directory:** `./`
- **Build Command:** `next build` (default)
- **Output Directory:** `.next` (default)

### Step 3: Environment Variables
Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_DEFAULT_STORE_SLUG`.

### Step 4: Deploy
Click **Deploy**. Vercel will run `npm run build` and output the production preview URL (e.g. `https://project.vercel.app`).

---

## 4. Custom Domain Setup

1. In Vercel, navigate to **Project Settings → Domains**.
2. Enter the client's custom domain (e.g. `store.clientdomain.com` or `clientbrand.shop`).
3. Configure your DNS provider:
   - For subdomains (`store.clientdomain.com`): Add a `CNAME` record pointing to `cname.vercel-dns.com`.
   - For apex domains (`clientdomain.com`): Add an `A` record pointing to `76.76.21.21`.
4. Vercel will automatically issue an SSL certificate once DNS propagation completes.

---

## 5. Next.js 16 Production Configuration Notes

### Proxy Convention (`proxy.ts`)
Ensure `proxy.ts` exists in the repository root. Vercel automatically deploys `proxy.ts` as an Edge Proxy function.

### Static Page Optimization
`commerce-engine` uses hybrid dynamic/static page generation:
- Merchant pages (`/dashboard`, `/products`, `/categories`, `/settings`) compile as dynamic (`ƒ`) server-rendered routes.
- Storefront pages (`/store/[slug]`) build dynamically on-demand with streaming Server Components.
