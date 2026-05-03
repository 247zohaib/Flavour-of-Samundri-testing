# Flavors of Samundri — PRD

## Original Problem Statement
Create a modern and stylish home made food delivery website called "Flavors of Samundri" with a dark, chalkboard-inspired aesthetic that feels warm, inviting, and slightly rustic, like a cozy coffee shop. The design should feature a black or charcoal textured background with hand-drawn doodle elements such as coffee beans, arrows, and cup illustrations, along with white sketch-style graphics and accents. Use elegant handwritten or script fonts for headings and clean, simple sans-serif fonts for body text, keeping the layout minimal yet artistic. The website should include pages for Home, Menu, About Us, Contact, and Order Now. The Home page should have a hero section displaying the name and a tagline like "Savor Every Sip & Bite," along with featured menu highlights and call-to-action buttons such as View Menu, Visit Us, and Order Now. The Menu page should present categorized items with names, short descriptions, and prices, while the About page should emphasize passion, quality ingredients, and a cozy atmosphere. The Contact page should include the address, phone number, and opening hours. Additional features should include subtle animations like fade-ins and hover effects, a mobile-friendly design, social media links, and an online order button.

## Architecture
- **Frontend:** React 19 + React Router 7 + Tailwind CSS + shadcn/ui + Sonner toasts. Fonts: Caveat (headings) + Outfit (body). State via React Context (Cart, Auth) with localStorage persistence.
- **Backend:** FastAPI + Motor (async MongoDB) on port 8001, all routes prefixed `/api`.
- **Auth:** Custom JWT (HS256) + bcrypt password hashing. Admin user seeded idempotently on startup from `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars. 12-hour access token, stored in localStorage under key `fos_admin_v1`. Bearer token attached to admin endpoints.
- **Database collections:** `orders`, `contact_messages`, `admin_users`. Indexes on `admin_users.email` (unique), `orders.created_at`, `contact_messages.created_at`.

## User Personas
- **Customer (public):** Browses menu, adds to cart, places delivery or pickup order; can also send the order via WhatsApp; can submit contact-form messages.
- **Owner / Restaurant Staff (private):** Logs into `/admin` to monitor sales, fulfil orders, and read customer messages.

## Core Requirements (Static)
1. Five public pages — Home, Menu, About, Contact, Order — with chalkboard dark theme.
2. Hero with brand + tagline "Savor every sip & bite" + CTAs: View Menu, Visit Us, Order Now.
3. Featured menu on home and full categorized menu page.
4. Cart-based ordering with delivery / pickup toggle.
5. Contact form persisted to DB.
6. Private owner dashboard at `/admin` (not linked from public nav) with sales stats, orders list, status updates, contact messages, CSV export, JWT auth.

## What's Been Implemented
### 2026-05-03 — MVP build
- Public site: Home (hero + featured + marquee + story strip + CTA), Menu (category tabs + grouped items), About (story + pillars + quote), Contact (info card + form posting to `/api/contact`), Order (cart + delivery/pickup toggle + WhatsApp + DB submit), Header (sticky, mobile-responsive, cart drawer), Footer (address, phone, hours, social).
- 19 menu items across Main Course, Breads & Sides, Chai & Coffee, Desserts, Refreshers (Pakistani/Punjabi homemade + chai/coffee).
- Restaurant info: Shahbaz Garden, Samundri • 0308-0471471 • 11:00 AM – 12:00 AM daily.
- Cart context with localStorage persistence; sliding cart drawer; quantity +/- and remove.
- Delivery vs pickup order types: pickup hides address, shows pickup-location info + optional pickup-time field; delivery requires address (validated server-side).
- WhatsApp send button composes message with order details to `wa.me/923080471471`.
- Owner dashboard at `/admin` with JWT-protected route:
  - Stat cards: Total Revenue, Today's Revenue, Pending count, Unread Messages.
  - Orders tab: filter by status, inline status `<select>` (pending → confirmed → preparing → out_for_delivery / ready_for_pickup → completed / cancelled), customer name, phone, type, address, items, notes, total.
  - Messages tab: list of contact-form submissions, mark-as-read.
  - CSV export of all orders, sign out, refresh.
- Admin user seeded from env at startup (idempotent, updates hash if password changes).
- Test credentials saved at `/app/memory/test_credentials.md`.

### Test Coverage
- Iteration 2 (2026-05-03): Backend 28/28 tests pass; frontend admin + pickup/delivery flows verified end-to-end. No critical or minor issues.

## Backlog / Future Enhancements
### P1
- [ ] Brute-force lockout on `/api/admin/login` (e.g. 5 failed attempts → 15-min lockout) — playbook recommended, not yet implemented.
- [ ] Migrate FastAPI startup/shutdown to `lifespan` handler (deprecation warning).
- [ ] Pagination on `/api/admin/orders` once volume grows.
- [ ] Hard-fail on missing `JWT_SECRET` in production rather than fallback.

### P2
- [ ] Featured-item curation tool from dashboard (currently hard-coded).
- [ ] Daily / weekly / monthly sales charts.
- [ ] SMS / email notification to customer on status change.
- [ ] Multiple admin users with role-based permissions.
- [ ] Online payment integration (Stripe / JazzCash / Easypaisa).
- [ ] Customer-facing order tracking page.
- [ ] Image upload for menu items + admin menu CRUD.

### P3
- [ ] Loyalty program / coupon codes.
- [ ] Multi-branch support.
- [ ] Native mobile app.

## Credentials (current)
- **Owner / Admin email:** `owner@flavorsofsamundri.com`
- **Owner / Admin password:** `Samundri@2026`
- **Login URL:** `/admin/login`
- **Dashboard URL:** `/admin`
