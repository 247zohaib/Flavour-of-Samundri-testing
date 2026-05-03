# Flavors of Samundri — PRD

## Original Problem Statement
Create a modern and stylish home made food delivery website called "Flavors of Samundri" with a dark, chalkboard-inspired aesthetic that feels warm, inviting, and slightly rustic, like a cozy coffee shop. The design should feature a black or charcoal textured background with hand-drawn doodle elements such as coffee beans, arrows, and cup illustrations, along with white sketch-style graphics and accents. Use elegant handwritten or script fonts for headings and clean, simple sans-serif fonts for body text, keeping the layout minimal yet artistic. The website should include pages for Home, Menu, About Us, Contact, and Order Now. The Home page should have a hero section displaying the name and a tagline like "Savor Every Sip & Bite," along with featured menu highlights and call-to-action buttons such as View Menu, Visit Us, and Order Now. The Menu page should present categorized items with names, short descriptions, and prices, while the About page should emphasize passion, quality ingredients, and a cozy atmosphere. The Contact page should include the address, phone number, and opening hours. Additional features should include subtle animations like fade-ins and hover effects, a mobile-friendly design, social media links, and an online order button.

**Subsequent additions requested by user:**
- Pickup option alongside delivery on the order page (with customer contact still required so the owner can call about pickup details).
- Private owner dashboard (not linked from the public site) showing orders placed, sale totals, and recording of orders.
- Most secure auth: email + password with bcrypt + JWT.
- Revenue must count **only** completed orders. Cancelled orders must be excluded from revenue.

---

## Architecture
- **Frontend:** React 19 + React Router 7 + Tailwind CSS + shadcn/ui + Sonner toasts. Fonts: Caveat (headings) + Outfit (body). State via React Context (Cart, Auth) with localStorage persistence.
- **Backend:** FastAPI + Motor (async MongoDB) on port 8001. All routes prefixed `/api`. Public router under `/api`; admin router under `/api/admin`.
- **Auth:** Custom JWT (HS256) + bcrypt password hashing. Admin user seeded idempotently on startup from `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars. 12-hour access token, stored in browser `localStorage` under key `fos_admin_v1`. Bearer token attached to every admin request.
- **Database collections:** `orders`, `contact_messages`, `admin_users`. Indexes on `admin_users.email` (unique), `orders.created_at`, `contact_messages.created_at`.

---

## User Personas
- **Customer (public):** Browses menu, adds to cart, places delivery or pickup order; can also send the order via WhatsApp; can submit contact-form messages.
- **Owner / Restaurant Staff (private):** Logs into `/admin` to monitor sales, fulfil orders, and read customer messages.

---

## Core Requirements (Static)
1. Five public pages — Home, Menu, About, Contact, Order — with chalkboard dark theme.
2. Hero with brand + tagline "Savor every sip & bite" + CTAs: View Menu, Visit Us, Order Now.
3. Featured menu on home and full categorized menu page.
4. Cart-based ordering with delivery / pickup toggle.
5. Contact form persisted to DB.
6. Private owner dashboard at `/admin` (not linked from public nav) with sales stats, orders list, status updates, contact messages, CSV export, JWT auth.
7. **Revenue counts only `completed` orders.** Cancelled orders are surfaced separately and excluded from revenue.

---

## What's Been Implemented

### 2026-05-03 — MVP build
- **Public site:** Home (hero + featured + marquee + story strip + CTA), Menu (category tabs + grouped items), About (story + pillars + quote), Contact (info card + form posting to `/api/contact`), Order (cart + delivery/pickup toggle + WhatsApp + DB submit), Header (sticky, mobile-responsive, cart drawer), Footer (address, phone, hours, social).
- **19 menu items** across Main Course, Breads & Sides, Chai & Coffee, Desserts, Refreshers (Pakistani/Punjabi homemade + chai/coffee).
- **Restaurant info:** Shahbaz Garden, Samundri • 0308-0471471 • 11:00 AM – 12:00 AM daily.
- **Cart context** with localStorage persistence; sliding cart drawer; quantity +/- and remove.
- **Delivery vs pickup** order types: pickup hides address, shows pickup-location info + optional pickup-time field; delivery requires address (validated server-side).
- **WhatsApp send button** composes message with order details to `wa.me/923080471471`.

### 2026-05-03 — Owner Dashboard
- **Private route `/admin`** with JWT-protected access; login page at `/admin/login`. Not linked from public navigation.
- **Stat cards (primary):** Total Revenue (completed only), Today's Revenue (completed only), Pending count, Unread Messages.
- **Stat cards (secondary):** Cancelled orders + cancelled value (excluded from revenue), All Orders (count of every status), explanatory note.
- **Orders tab:** filter by status (all / pending / confirmed / preparing / out_for_delivery / ready_for_pickup / completed / cancelled), inline status `<select>` to update each order, customer name, phone, type icon (Delivery/Pickup), address, items list, notes, total.
- **Messages tab:** list of contact-form submissions with mark-as-read.
- **CSV export** of all orders, refresh, sign out.
- **Admin user** seeded from env at startup (idempotent — updates hash if `ADMIN_PASSWORD` changes).

### 2026-05-03 — Revenue accuracy update
- `/api/admin/stats` now aggregates revenue **only from orders with `status = "completed"`**. Cancelled orders are excluded from `total_revenue` and `today_revenue`. Returns separate `cancelled_orders` count and `cancelled_value` for transparency.
- Dashboard UI shows two stat rows (primary revenue, secondary cancelled / all-orders) plus an explicit explanatory note.

### Test Coverage
- **Iteration 1:** Backend 9/9 pass. Initial frontend testid fixes applied (`order-submit`, `order-item-{id}`).
- **Iteration 2:** Backend 28/28 pass. All admin auth + dashboard + pickup/delivery frontend flows verified end-to-end. No outstanding bugs.

---

## API Surface

### Public
- `GET    /api/`
- `GET    /api/menu` — query: `category`, `featured`
- `GET    /api/menu/categories`
- `POST   /api/orders` — body: `{customer_name, phone, order_type: "delivery"|"pickup", address?, notes?, items[], total}`. Validates: pickup → no address required; delivery → address required.
- `POST   /api/contact` — body: `{name, email, phone?, message}`

### Admin (require `Authorization: Bearer <jwt>`)
- `POST   /api/admin/login` — body: `{email, password}` → `{token, user}`
- `GET    /api/admin/me`
- `GET    /api/admin/stats` — `{total_revenue, completed_orders, total_orders, today_revenue, today_orders, cancelled_orders, cancelled_value, by_status, unread_messages}`
- `GET    /api/admin/orders` — query: `status`, `limit`
- `PATCH  /api/admin/orders/{id}` — body: `{status}`. Allowed statuses: `pending|confirmed|preparing|out_for_delivery|ready_for_pickup|completed|cancelled`.
- `GET    /api/admin/messages`
- `PATCH  /api/admin/messages/{id}/read`

---

## Credentials
- **Owner / Admin email:** `owner@flavorsofsamundri.com`
- **Owner / Admin password:** `Samundri@2026`
- **Login URL:** `/admin/login`
- **Dashboard URL:** `/admin`

To rotate the password: edit `ADMIN_PASSWORD` in `/app/backend/.env` then `sudo supervisorctl restart backend`. The seed routine will hash the new value automatically.

---

## Environment Variables
### `/app/backend/.env`
```
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"
CORS_ORIGINS="*"
JWT_SECRET="<64-char hex>"
ADMIN_EMAIL="owner@flavorsofsamundri.com"
ADMIN_PASSWORD="Samundri@2026"
```

### `/app/frontend/.env`
```
REACT_APP_BACKEND_URL=https://artisan-samundri.preview.emergentagent.com
WDS_SOCKET_PORT=443
ENABLE_HEALTH_CHECK=false
```

---

## File Map
```
/app/backend/
├── server.py              # all endpoints + auth + admin dashboard
├── .env                   # mongo, jwt, admin creds
└── requirements.txt

/app/frontend/src/
├── App.js                 # routes (PublicLayout + /admin/login + protected /admin)
├── App.css
├── index.css              # chalkboard theme + Caveat/Outfit fonts
├── context/
│   ├── CartContext.jsx
│   └── AuthContext.jsx    # JWT in localStorage
├── components/
│   ├── Header.jsx
│   ├── Footer.jsx
│   ├── CartDrawer.jsx
│   ├── MenuCard.jsx
│   ├── Doodles.jsx        # hand-drawn SVG accents
│   ├── PublicLayout.jsx
│   ├── ProtectedRoute.jsx
│   └── ScrollToTop.jsx
└── pages/
    ├── Home.jsx
    ├── MenuPage.jsx
    ├── About.jsx
    ├── Contact.jsx
    ├── Order.jsx          # cart + delivery/pickup toggle + WhatsApp
    ├── AdminLogin.jsx
    └── AdminDashboard.jsx # stats + orders + messages + CSV
```

---

## Backlog / Future Enhancements

### P1
- [ ] Brute-force lockout on `/api/admin/login` (5 fails → 15-min lock).
- [ ] Migrate FastAPI startup/shutdown to `lifespan` handler.
- [ ] Pagination on `/api/admin/orders` once volume grows.
- [ ] Hard-fail on missing `JWT_SECRET` in production rather than fallback.
- [ ] One-click "Send WhatsApp confirmation to customer" button on each order card (auto-builds message with order id, status, total).

### P2
- [ ] Daily / weekly / monthly sales charts on dashboard.
- [ ] SMS / email notification to customer on status change.
- [ ] Multiple admin users with role-based permissions.
- [ ] Online payment integration (JazzCash / Easypaisa / Stripe).
- [ ] Customer-facing order tracking page.
- [ ] Image upload for menu items + admin menu CRUD (currently menu is hard-coded in `MENU_DATA`).
- [ ] Featured-item curation tool on dashboard.

### P3
- [ ] Loyalty program / coupon codes.
- [ ] Multi-branch support.
- [ ] Native mobile app.

---

## Saving to GitHub
This codebase is ready to push. From the Emergent platform, use the **Save to GitHub** button (top-right). All required files live under `/app/backend` and `/app/frontend`, with secrets isolated in the two `.env` files (which should remain local — the platform handles that for you).
