# 08 — Sprint 5: Admin Panel

## What Was Built

Sprint 5 adds a password-protected admin panel. It gives operators full CRUD control over the product catalogue and a one-click button to re-trigger the NLP analysis pipeline — all without touching the database directly.

---

## New File Structure

```
backend/app/
├── routers/
│   └── admin.py          ← CRUD + stats + re-analyse endpoints
├── services/
│   └── cache.py          ← added cache_delete_prefix helper
└── config.py             ← added admin_api_key setting

src/
├── api/
│   └── admin.ts          ← admin API client (auth, CRUD calls)
└── pages/admin/
    ├── AdminLayout.tsx    ← sidebar shell for /admin routes
    ├── AdminLogin.tsx     ← key-based login screen
    ├── AdminDashboard.tsx ← stats + NLP trigger
    └── AdminProducts.tsx  ← product table + add/edit/delete modal
```

---

## Accessing the Admin Panel

1. Navigate to `http://localhost:5173/admin` (or click "Admin Panel" in the sidebar)
2. Enter the admin key: `reviewlens-admin` (default)
3. Key is stored in `localStorage` — you stay logged in across refreshes

To use a custom key set the env var before starting Docker:
```env
ADMIN_API_KEY=your-secret-key
```

---

## API Endpoints

All admin endpoints require the `x-admin-key` header.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/stats` | Dashboard stats (products, reviews, sentiment) |
| GET | `/api/admin/products` | List products (search, category, pagination) |
| POST | `/api/admin/products` | Create a new product |
| PUT | `/api/admin/products/:id` | Update an existing product |
| DELETE | `/api/admin/products/:id` | Delete a product (cascades reviews) |
| POST | `/api/admin/analyse` | Trigger NLP re-analysis (returns Celery task ID) |

### Authentication

```bash
curl http://localhost:8000/api/admin/stats \
  -H "x-admin-key: reviewlens-admin"
```

A wrong key returns `401 Unauthorized`. The key is read from `ADMIN_API_KEY` env var (default: `reviewlens-admin`).

### Create a product
```bash
curl -X POST http://localhost:8000/api/admin/products \
  -H "x-admin-key: reviewlens-admin" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sony WH-1000XM5",
    "brand": "Sony",
    "category": "Headphones",
    "price": 349,
    "rating": 4.7,
    "icon": "🎧",
    "quote": "Industry-leading noise cancellation"
  }'
```

### Trigger NLP re-analysis
```bash
curl -X POST http://localhost:8000/api/admin/analyse \
  -H "x-admin-key: reviewlens-admin"
# → { "task_id": "abc-123", "status": "queued" }

# Poll for result
curl http://localhost:8000/api/analyse/status/abc-123
```

---

## Frontend Pages

### Login (`/admin/login`)
- Password-style input for the admin key
- Calls `GET /api/admin/stats` to verify — valid key navigates to dashboard, wrong key shows error
- No key stored in state — goes into `localStorage` on success

### Dashboard (`/admin`)
- **3 stat cards**: total products, total reviews, % positive sentiment
- **Sentiment breakdown bar chart** (positive / neutral / negative)
- **Products by category** grid
- **Run NLP Analysis** button — fires `POST /api/admin/analyse`, polls `GET /api/analyse/status/:id` every 2 s, shows spinner → success state, refreshes stats when complete

### Products (`/admin/products`)
- Searchable, filterable table (search by name/brand, filter by category)
- Debounced search input (350 ms) — no extra requests while typing
- Paginated: 20 products per page with Previous/Next controls
- **Edit** (pencil icon) — opens modal pre-filled with product data
- **Delete** (trash icon) — opens confirm dialog, deletes on confirm
- **Add Product** — opens blank form modal

### Add / Edit Modal
Fields: name, brand, category, price, rating, icon (emoji), review count, quote, pros (one per line), cons (one per line).

On save:
- POST `/api/admin/products` for new products
- PUT `/api/admin/products/:id` for edits
- Row is updated in the table immediately (optimistic local state)
- Redis cache is invalidated for the affected product and products list

---

## Auth Design

The admin key is sent as an HTTP header (`x-admin-key`), not a cookie or bearer token. This is intentional for a demo/internal tool:

- Simple to use with curl and Swagger UI
- No CSRF risk (custom header blocks cross-origin form submissions)
- No token expiry to manage

For a public-facing admin panel, replace with JWT + refresh tokens.

---

## Cache Invalidation

After every write (create / update / delete), the admin router calls `cache_delete_prefix` to bust stale Redis entries:

```python
await cache_delete_prefix(f"product:{product_id}")  # single product cache
await cache_delete_prefix("products:")               # list/top-reviewed caches
```

This ensures the public-facing API reflects changes immediately after a write.

---

## What's Next

- **Sprint 6** — Real data: import products and reviews from a Kaggle dataset
- **Sprint 7** — Recommendation engine based on aspect similarity scores
