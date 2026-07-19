# iGotThrift SaaS - Project Specification

## Overview

Build a production-ready multi-tenant WhatsApp Commerce SaaS platform.

The platform should allow multiple merchants to create and manage their own online stores while customers can browse products and place orders through WhatsApp.

This is NOT a Shopify clone. It is a lightweight WhatsApp commerce platform inspired by the clean UI and UX of modern Shopify themes.

---

# Technology Stack

## Frontend

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons

## Backend

- Supabase

Use:

- PostgreSQL
- Authentication
- Storage
- Row Level Security

## Deployment

Frontend:
- Vercel

Backend:
- Supabase

---

# Architecture

Single Next.js application.

The application has two portals.

1. Customer Storefront (Public)
2. Merchant Dashboard (Protected)

Both portals share the same Supabase backend.

The application must be designed as a multi-tenant SaaS.

---

# Multi-Tenant Requirements

Every merchant owns one store.

Every store has:

- Store Name
- Store Slug
- Logo
- Banner
- WhatsApp Number
- Theme Color

Each merchant must only access their own data.

Use tenant_id throughout the database.

Future support for custom domains should be considered.

---

# Portal 1 - Customer Storefront

Public.

No authentication.

Features:

- Home Page
- Hero Banner
- Featured Products
- Categories
- Product Listing
- Product Details
- Product Images
- Search
- Filter by Category
- Shopping Cart
- Responsive Design

Checkout is NOT required.

Payment gateway is NOT required.

Customers place orders using WhatsApp.

---

# WhatsApp Checkout

When customer clicks "Order on WhatsApp"

Generate a message like:

Hello,

I would like to order:

1.
Product Name

Quantity: 2

Price: ₹499

2.
Another Product

Quantity: 1

Price: ₹299

Total: ₹1297

Customer Name:

Phone Number:

Delivery Address:

Open:

https://wa.me/{merchant_number}?text={encoded_message}

---

# Portal 2 - Merchant Dashboard

Authentication required.

Merchant Login

Dashboard

Products

Categories

Store Settings

Logout

---

## Merchant Features

### Dashboard

Show

- Total Products
- Categories
- Recent Products

---

### Products

CRUD

Merchant can

- Add Product
- Edit Product
- Delete Product
- Upload Images
- Enable/Disable Product

Fields

- Name
- Price
- Description
- Images
- Category
- Active

---

### Categories

CRUD

Merchant can

- Add Category
- Edit Category
- Delete Category

---

### Store Settings

Merchant can edit

- Store Name
- Logo
- Banner
- WhatsApp Number
- Theme Color
- Address
- Social Links

---

# Authentication

Use Supabase Authentication.

Protected routes:

/merchant/login
/merchant/dashboard
/merchant/products
/merchant/categories
/merchant/settings

Public routes:

/
/store/[slug]
/store/[slug]/product/[id]

Customers never log in.

Only merchants authenticate.

---

# Database

Suggested tables

tenants

profiles

categories

products

product_images

store_settings

Future:

orders

customers

analytics

---

# Storage

Use Supabase Storage.

Store

- Product Images
- Logo
- Banner Images

---

# Security

Use Row Level Security.

Requirements

Merchant A cannot access Merchant B data.

Merchant B cannot access Merchant A data.

Customers only read public products.

---

# UI

Design inspiration:

Modern Shopify themes.

Requirements

- Premium
- Minimal
- Fast
- Mobile First
- Responsive
- Clean Typography
- Large Product Images
- Smooth Animations

DO NOT copy Shopify branding.

Create an original design inspired by modern ecommerce websites.

---

# Folder Structure

Use scalable architecture.

Separate

- Storefront
- Merchant Dashboard
- Shared Components
- Services
- Hooks
- Types
- Utilities

Use reusable components.

---

# Code Quality

Use

- TypeScript
- Strict typing
- Reusable components
- Server Components where appropriate
- Client Components only when necessary
- Clean folder structure
- Error boundaries
- Loading states
- Empty states
- Zod validation

---

# AI Development Rules

Before implementing any feature:

1. Explain the architecture.
2. Explain why the approach is chosen.
3. List files that will be created or modified.
4. Wait for approval if the change is large.

Never generate the entire application in one step.

Implement milestone by milestone.

Each milestone must:

- Compile successfully
- Have no TypeScript errors
- Be production-ready

---

# Milestones

1. Project Setup
2. Folder Structure
3. Supabase Integration
4. Database Schema
5. Authentication
6. Merchant Dashboard
7. Product CRUD
8. Category CRUD
9. Image Upload
10. Public Storefront
11. Cart
12. WhatsApp Checkout
13. Responsive UI
14. Deployment

---

# Goal

Create a reusable SaaS platform that can be used for unlimited merchants by simply creating a new tenant without changing the codebase.

The project should be maintainable, scalable, and production-ready.