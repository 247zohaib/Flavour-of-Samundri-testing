# Flavors of Samundri

A modern dark chalkboard-themed food-delivery website for a homemade Pakistani / Punjabi cafe in Samundri, plus a private owner dashboard for managing orders and tracking sales.

**Live preview:** https://artisan-samundri.preview.emergentagent.com  
**Owner dashboard login:** `/admin/login`  (credentials in `/app/memory/test_credentials.md`)

---

## Features

### Customer-facing
- **Home** — hero with tagline *"Savor every sip & bite"*, featured menu, marquee, CTAs (View Menu / Visit Us / Order Now)
- **Menu** — 19 items across Main Course, Breads & Sides, Chai & Coffee, Desserts, Refreshers
- **About** — cozy brand story, quality pillars, quote
- **Contact** — address, phone, hours, social links, message form (persisted to DB)
- **Order Now** — cart with delivery / pickup toggle; WhatsApp send option; DB submission
- Responsive mobile nav, sonner toasts, fade-in / hover animations

### Owner Dashboard (private, `/admin`)
- Email + password login (JWT + bcrypt)
- Stat cards — **Total Revenue** (completed orders only), **Today's Revenue**, Pending count, Unread Messages, Cancelled count + lost value, All Orders
- Orders list with inline status dropdown (pending → confirmed → preparing → out_for_delivery / ready_for_pickup → completed / cancelled)
- Filter orders by status
- Customer messages tab with mark-as-read
- CSV export of all orders
- Sign out, refresh

---

## Stack

| Layer     | Tech                                                                 |
|-----------|----------------------------------------------------------------------|
| Frontend  | React 19, React Router 7, Tailwind CSS, shadcn/ui, Sonner, lucide-react |
| Backend   | FastAPI, Motor (async MongoDB), PyJWT, bcrypt                        |
| Database  | MongoDB                                                              |
| Fonts     | Caveat (headings), Outfit (body)                                     |

---

## Local Setup

### 1. Clone and install
```bash
git clone <your-repo-url>
cd flavors-of-samundri

# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd ../frontend
yarn install
```

### 2. Configure environment
Create `backend/.env`:
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="flavors_of_samundri"
CORS_ORIGINS="*"
JWT_SECRET="<generate 64-char hex, e.g. openssl rand -hex 32>"
ADMIN_EMAIL="owner@flavorsofsamundri.com"
ADMIN_PASSWORD="change-me-in-production"
```

Create `frontend/.env`:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

### 3. Run
```bash
# Start MongoDB locally (e.g. mongod or docker run -p 27017:27017 mongo)

# Backend (from /backend)
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Frontend (from /frontend)
yarn start
```

The admin user is auto-seeded from `.env` on first backend start.

---

## API Summary

### Public
- `GET  /api/menu` — query `?category=`, `?featured=true`
- `GET  /api/menu/categories`
- `POST /api/orders` — body: `{customer_name, phone, order_type: "delivery"|"pickup", address?, items, total, notes?}`
- `POST /api/contact` — body: `{name, email, phone?, message}`

### Admin (Bearer token required)
- `POST  /api/admin/login` — `{email, password}` → `{token, user}`
- `GET   /api/admin/me`
- `GET   /api/admin/stats`
- `GET   /api/admin/orders?status=`
- `PATCH /api/admin/orders/{id}` — `{status}`
- `GET   /api/admin/messages`
- `PATCH /api/admin/messages/{id}/read`

---

## Project Structure
```
.
├── backend/
│   ├── server.py           # FastAPI app + all routes
│   ├── requirements.txt
│   └── .env                # (gitignored)
├── frontend/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── craco.config.js
│   ├── postcss.config.js
│   ├── jsconfig.json
│   ├── public/index.html
│   └── src/
│       ├── App.js
│       ├── App.css
│       ├── index.js
│       ├── index.css
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── CartContext.jsx
│       ├── components/
│       │   ├── Header.jsx
│       │   ├── Footer.jsx
│       │   ├── CartDrawer.jsx
│       │   ├── MenuCard.jsx
│       │   ├── Doodles.jsx
│       │   ├── PublicLayout.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── ScrollToTop.jsx
│       │   └── ui/          # shadcn components
│       └── pages/
│           ├── Home.jsx
│           ├── MenuPage.jsx
│           ├── About.jsx
│           ├── Contact.jsx
│           ├── Order.jsx
│           ├── AdminLogin.jsx
│           └── AdminDashboard.jsx
└── README.md
```

---

## Default Credentials
- **Email:** `owner@flavorsofsamundri.com`
- **Password:** `Samundri@2026`

> **Rotate the password before going live.** Edit `ADMIN_PASSWORD` in `backend/.env` and restart backend — the seed routine will re-hash automatically.

---

## License
Private — all rights reserved.
