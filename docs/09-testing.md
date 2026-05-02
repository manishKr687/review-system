# 09 — Testing

## Overview

ReviewLens has two independent test suites — one for the frontend (Vitest + React Testing Library) and one for the backend (pytest + httpx). All tests run without Docker for the frontend and with a shared Docker service for the backend.

| Suite | Runner | Tests | Coverage |
|-------|--------|-------|---------|
| Frontend | Vitest 4.x | 98 | Components, hooks, pages, admin UI |
| Backend | pytest 8.x | 61 | All HTTP endpoints, NLP service |
| **Total** | | **159** | |

---

## Running Tests

### Frontend
```bash
# Watch mode (dev)
npm test

# Single run (CI)
npm run test:run

# With coverage report
npm run test:coverage
```

### Backend (inside Docker)
```bash
docker-compose run --rm api python -m pytest tests/ -v
```

### Backend (local venv)
```bash
cd backend
pip install -r requirements.txt
pytest tests/ -v
```

---

## Frontend Test Suite

**Framework**: Vitest 4 + React Testing Library + jsdom

**Setup**: `src/test/setup.ts` — configures `@testing-library/jest-dom` matchers.

**Key config** (`vite.config.ts`):
```ts
test: {
  env: { VITE_API_URL: '' },  // forces mock mode — .env.local is NOT loaded in tests
}
```
Without this override, `VITE_API_URL=http://localhost:8000` from `.env.local` would enable API mode, causing all hooks to fire real fetches and fail.

### Test files

| File | What it tests |
|------|--------------|
| `StarRating.test.tsx` | Filled/empty/half stars, size classes |
| `Header.test.tsx` | Search input, buttons, user badge |
| `HeroSection.test.tsx` | Rating display, aspect labels |
| `TopReviewedProducts.test.tsx` | Product card grid |
| `Compare.test.tsx` | Empty state, product comparison table |
| `Watchlist.test.tsx` | Empty state, saved products list |
| `SearchResults.test.tsx` | Query results, empty/no-match states |
| `ProductDetail.test.tsx` | Product info, tab switching, Save/Compare |
| `AdminLogin.test.tsx` | Form display, auth success/failure, localStorage |
| `AdminDashboard.test.tsx` | Stats display, NLP trigger button |
| `AdminProducts.test.tsx` | Table render, modal open/close/submit |
| `useProducts.test.ts` | All 7 hooks: data shape, filtering, empty states |

### Patterns

**Rendering pages with routing:**
```tsx
render(
  <MemoryRouter initialEntries={['/product/1']}>
    <Routes>
      <Route path="/product/:id" element={<ProductDetail />} />
    </Routes>
  </MemoryRouter>
)
```

**Mocking fetch for admin pages:**
```ts
vi.spyOn(global, 'fetch').mockResolvedValue(
  new Response(JSON.stringify(mockStats), { status: 200 })
)
```

**Scoping queries to a modal:**
```ts
const modal = screen.getByRole('heading', { name: /add product/i }).closest('div.bg-white')!
const m = within(modal)
expect(m.getByText(/^name$/i)).toBeInTheDocument()
```

**Testing hooks directly:**
```ts
const { result } = renderHook(() => useSearch('iphone'))
expect(result.current.data![0].name).toMatch(/iPhone/i)
```

---

## Backend Test Suite

**Framework**: pytest 8 + pytest-asyncio + httpx (async test client)

**Database**: SQLite in-memory (`aiosqlite` for async, `sqlite3` for sync) — no PostgreSQL needed.

**Config** (`backend/pytest.ini`):
```ini
[pytest]
asyncio_mode = auto
testpaths = tests
```

### Test files

| File | What it tests |
|------|--------------|
| `test_products.py` | List, filter, sort, featured, top-reviewed, search |
| `test_reviews.py` | Get reviews, sentiment/verified filters |
| `test_admin.py` | Auth header, stats, CRUD create/update/delete |
| `test_nlp.py` | Sentiment labels, aspect extraction, score scaling |

### Fixtures (`conftest.py`)

| Fixture | What it provides |
|---------|----------------|
| `reset_db` (autouse) | Creates tables before each test, drops after |
| `db_session` | Async SQLAlchemy session pointing to test DB |
| `client` | `httpx.AsyncClient` with DB override injected |
| `sample_product` | A seeded `Product` row |
| `sample_review` | A seeded `Review` row (positive, verified) |

**DB override pattern** — injects the test SQLite session into FastAPI's `get_db` dependency:
```python
async def override_get_db():
    async with _async_session() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db
```

### Admin auth tests

Wrong key returns 401:
```python
res = await client.get("/api/admin/stats", headers={"x-admin-key": "wrong"})
assert res.status_code == 401
```

Missing header returns 422 (FastAPI validation):
```python
res = await client.get("/api/admin/stats")
assert res.status_code == 422
```

### NLP unit tests

Pure Python — no DB, no HTTP. Tests cover:
- `analyse_sentiment`: positive/negative/neutral classification, score range [-1, 1]
- `extract_aspect_sentiments`: aspect detection per keyword group, score range [1, 5]
- `score_to_aspect_rating`: VADER compound → 1–5 star mapping

Scale reference:
| compound | rating |
|----------|--------|
| -1.0 | 1.0 (clamped) |
| 0.0 | 2.0 (neutral baseline) |
| 1.0 | 4.0 |
| >1.5 | 5.0 (clamped) |

---

## CI Notes

To run both suites in a single pipeline step:
```bash
# Frontend
npm run test:run

# Backend
docker-compose run --rm api python -m pytest tests/ --tb=short -q
```

Both exit with code 0 on success, non-zero on failure — suitable for GitHub Actions or any CI system.
