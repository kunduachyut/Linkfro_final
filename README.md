## Santanu Marketplace

A Next.js 15 marketplace where publishers list websites and consumers purchase access/placements, with approval workflows, Stripe integration (webhook-ready), Clerk authentication, and MongoDB via Mongoose.

### Key Features
- Publisher website submissions with approval workflow (pending → approved/rejected)
- Role-aware listings: public sees approved; owners see their items; admins see all
- Consumer dashboard with cart, purchases, and ad request workflow
- Stripe webhook to confirm purchases (checkout creation endpoint pending)
- Clerk-based authentication middleware
- Tailwind CSS 4 styling

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm/yarn
- MongoDB connection (Atlas or local)
- Clerk application (for auth)
- Stripe account (for payments)

### Installation
1. Install dependencies:
   - pnpm install
2. Create a `.env.local` at project root with the following variables:
   - MONGODB_URI=your-mongodb-uri
   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
   - CLERK_SECRET_KEY=sk_...
   - STRIPE_SECRET_KEY=sk_live_or_test
   - STRIPE_WEBHOOK_SECRET=whsec_...
3. Run the dev server:
   - pnpm dev
4. Open the app at `http://localhost:3000`

## Scripts
- dev: Next dev with Turbopack
- build: Next build
- start: Next start
- lint: Lint via Next/ESLint

## Tech Stack
- Next.js 15 (App Router), React 19, TypeScript
- Clerk for auth (`@clerk/nextjs`)
- Mongoose for MongoDB
- Stripe for payments
- Tailwind CSS 4

## Directory Structure

```
src/
  app/
    api/
      websites/                REST for website collection
        route.ts               GET list (filter/paginate), POST create
        [id]/route.ts          GET/PATCH/DELETE single website
      ad-requests/route.ts     GET/POST ad requests
      purchases/route.ts       Demo in-memory purchases (to be replaced by DB)
      checkout/route.ts        (placeholder – implement Stripe Checkout creation)
      webhooks/stripe/stripe/route.ts  Stripe webhook to mark purchases paid
    cart/page.tsx              Cart page (uses CartContext)
    context/CartContext.tsx    LocalStorage-backed cart provider
    dashboard/
      consumer/page.tsx        Marketplace + purchases UI
      publisher/page.tsx       Submit and manage websites, see ad requests
      superadmin/page.tsx      Admin dashboard (roles stubbed)
    layout.tsx, page.tsx, globals.css

  components/
    CartButton.tsx, CartDrawer.tsx, ...   Reusable UI components

  lib/
    db.ts                      Mongoose connection (cached in global)
    auth.ts                    Clerk auth helper (requireAuth)

  models/
    Website.ts                 Website schema + methods + indexes
    Purchase.ts                Purchase schema (status, amount, stripeSessionId)
    AdRequest.ts               Ad request schema

  utils/
    types.ts                   Zod schemas: WebsiteCreateSchema, AdRequestSchema
    lib/types.ts               Frontend TypeScript types

middleware.ts                  Clerk middleware (route protection)
```

## Data Models (Mongoose)

### Website
- title, url, description, category, image, tags
- userId: string (owner)
- status: pending | approved | rejected
- price: number (stored as dollars)
- views, clicks, featured, SEO fields
- Methods: approve(), reject(), isPending/Approved/Rejected
- Indexes: `{ userId, status }`, `{ status, createdAt }`, `{ category, status }`

### Purchase
- websiteId: ref Website
- buyerId: string
- amountCents: number
- status: pending | paid
- stripeSessionId?: string

### AdRequest
- websiteId: ref Website
- buyerId: string, publisherId: string
- message: string

## API Endpoints

### Websites
- GET `/api/websites`
  - Query: `owner=me`, `status`, `category`, `page`, `limit`
  - Returns paginated websites based on auth/role
- POST `/api/websites`
  - Body validated by `WebsiteCreateSchema`
  - Converts `priceCents` → `price` (dollars) on create; sets status `pending`
- GET `/api/websites/[id]`
  - Returns website; visibility depends on auth/ownership/role
- PATCH `/api/websites/[id]`
  - Superadmin: approve/reject
  - Owner: update limited fields when `pending`
- DELETE `/api/websites/[id]`
  - Owner or superadmin can delete

### Purchases
- GET `/api/purchases`
  - Current: in-memory demo list (replace with DB-backed endpoint)
- POST `/api/purchases`
  - Current: in-memory demo creation for cart items (to be replaced)
- PATCH `/api/purchases`
  - Current: in-memory status update (admin demo)

### Checkout (to implement)
- POST `/api/checkout`
  - Create Stripe Checkout Session for cart or single website
  - Create `Purchase` with `status=pending` and `stripeSessionId`
  - Return `{ url }` for redirect

### Stripe Webhook
- POST `/api/webhooks/stripe/stripe`
  - Verifies signature and marks `Purchase` as `paid` by `stripeSessionId`

### Ad Requests
- GET `/api/ad-requests?role=publisher|consumer`
  - For publisher: returns requests for owned sites
  - For consumer: returns requests created by the user
- POST `/api/ad-requests`
  - Requires a PAID purchase for the website
  - Body validated by `AdRequestSchema`

## Auth and Roles
- Auth via Clerk (`requireAuth` helper). Middleware protects most paths.
- Role resolution is stubbed in API (e.g., superadmin hardcoded); replace with Clerk user metadata/claims.

## Frontend Flows

### Publisher flow
1. Submit website from publisher dashboard (price input in dollars → sent as `priceCents`)
2. API stores `price` (dollars) and sets status `pending`
3. Superadmin approves/rejects
4. Publisher sees status and details; list normalizes price for correct display

### Consumer flow
1. Browse marketplace (approved websites only for public/consumer)
2. Add to cart and purchase
3. After payment confirmed by webhook, send ad request to publisher

## Data Consistency Notes (Important)
- Ownership field: use `userId` consistently (some places previously used `ownerId`). Update queries and population code accordingly.
- Price representation:
  - Server currently persists `price` in dollars but UI often uses `priceCents`.
  - Normalize on the client where needed (already done for consumer and publisher dashboard).
  - Recommended future change: store and return `priceCents` everywhere to avoid rounding issues.
- IDs in responses: `Website` `toJSON` maps `_id` → `id`. Prefer using `id` client-side for consistency.

## Environment & Configuration
- `src/lib/db.ts` requires `MONGODB_URI` at runtime; ensure it is set for dev and build.
- `src/middleware.ts` applies Clerk to most routes; keep public browse paths accessible by handling unauth in route handlers.
- `next.config.ts` is minimal; add image domains or headers if needed.

## Development Tips
- Use `pnpm dev` and ensure env variables are loaded.
- If Mongoose models recompile during HMR, schemas here guard with `mongoose.models.ModelName || ...`.
- Tailwind v4 is used; styles live in `globals.css` and utility classes.
- TypeScript config is permissive (`strict: false`); consider enabling and fixing incrementally.

## Roadmap
- Implement `/api/checkout` and DB-backed `/api/purchases`
- Replace role stubs with real Clerk roles/metadata
- Standardize price to `priceCents` across API and DB
- Publisher notifications for ad requests

## Troubleshooting
- Price displays as 0.00
  - Ensure client normalizes from `price`→`priceCents` when needed
  - Verify `WebsiteCreateSchema` input and server conversion
- Unauthorized errors
  - Check Clerk keys and middleware, and whether route allows unauthenticated access
- Stripe webhook 400
  - Confirm `STRIPE_WEBHOOK_SECRET`, raw body handling, and endpoint URL

## License
Proprietary – internal project. Adjust as needed.
# LinkFro
# LinkFro
