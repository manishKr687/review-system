# 05 — Sprint 2: Navigation & Inner Pages

## What Was Built

Sprint 2 wired the app into a fully navigable multi-page application using React Router, Zustand global state, and 5 new pages.

---

## New File Structure

```
src/
├── store/
│   └── useStore.ts              ← Zustand global state (compare, watchlist, search)
├── pages/
│   ├── Home.tsx                 ← Dashboard (extracted from App.tsx)
│   ├── ProductDetail.tsx        ← Full product view with reviews
│   ├── CategoryBrowse.tsx       ← Browse + filter all products
│   ├── Compare.tsx              ← Side-by-side product comparison
│   ├── SearchResults.tsx        ← Search results page
│   └── Watchlist.tsx            ← Saved/bookmarked products
├── components/
│   └── Layout.tsx               ← Shared Sidebar + Header shell (uses <Outlet>)
└── data/
    └── mockData.ts              ← Expanded: +10 products, reviews, summaries, helpers
```

---

## Routing

Defined in `App.tsx` using React Router v6 nested routes:

```
/               → Home (dashboard)
/product/:id    → ProductDetail
/categories     → CategoryBrowse
/compare        → Compare
/search?q=...   → SearchResults
/watchlist      → Watchlist
```

### How nested routes work

```tsx
<Route path="/" element={<Layout />}>   ← renders Sidebar + Header
  <Route index element={<Home />} />    ← <Outlet> fills with Home
  <Route path="product/:id" element={<ProductDetail />} />
</Route>
```

`<Layout>` renders `<Outlet>` — React Router replaces Outlet with the matched child page. This means Sidebar and Header appear on every page automatically.

---

## Global State (Zustand)

`src/store/useStore.ts` manages three pieces of state shared across pages:

### Compare List
```ts
compareList: number[]      // product IDs, max 4
addToCompare(id)           // adds if not already in + if < 4
removeFromCompare(id)      // removes one
clearCompare()             // empties the list
isInCompare(id): boolean   // check membership
```

### Watchlist
```ts
watchlist: number[]
toggleWatchlist(id)        // adds if absent, removes if present
isInWatchlist(id): boolean
```

### Search
```ts
searchQuery: string
setSearchQuery(q)          // syncs Header input with SearchResults
```

**Why Zustand?**
- No Provider needed — works anywhere with `useStore()`
- Compare list must be shared between ProductCard → Compare page
- Watchlist must be shared between ProductCard → Watchlist page
- Tiny bundle size (~1KB)

---

## Pages

### Home (`/`)
Extracted from the old `App.tsx`. Renders the 3-column dashboard layout: main content + right panel. The right panel is only on this page — other pages don't have it.

### ProductDetail (`/product/:id`)
Reads `:id` from URL params via `useParams`. Fetches product, reviews, and summary from mock data.

**Key concepts:**
```tsx
const { id } = useParams<{ id: string }>()
const product = getProductById(Number(id))
```

Two tabs:
- **Overview** — Pros & Cons cards + Review Highlights
- **Reviews** — Filterable list (All / Positive / Negative / Verified)

Review filter example:
```tsx
const filtered = allReviews.filter(r => {
  if (reviewFilter === 'positive') return r.sentiment === 'positive'
  if (reviewFilter === 'verified') return r.verified
  return true
})
```

### CategoryBrowse (`/categories`)
Local state drives filters + sort. `useMemo` recomputes the filtered list only when filters change — avoids unnecessary re-renders:

```tsx
const filtered = useMemo(() => {
  let list = allProducts.filter(...)
  // apply price, rating filters
  // apply sort
  return list
}, [activeCategory, sort, price, minRating])
```

### Compare (`/compare`)
Reads `compareList` from Zustand. Builds a table dynamically. Highlights the best value in each row with a 🏆 trophy icon:

```tsx
function getBestValue(values: number[]): number {
  return Math.max(...values.filter(v => v > 0))
}
// v > 0 excludes N/A aspects (headphones have no camera score)
```

### SearchResults (`/search?q=...`)
Reads query from URL search params:
```tsx
const [searchParams] = useSearchParams()
const q = searchParams.get('q') ?? ''
```

This means the URL is shareable — `/search?q=sony` always works.

The `searchProducts()` function in mockData.ts searches name, brand, category, and quote fields.

### Watchlist (`/watchlist`)
Reads `watchlist` from Zustand. Shows a grid of `ProductCard` components or an empty state with a CTA to browse.

---

## mockData Additions

| Addition | Details |
|----------|---------|
| `icon` field on Product | Emoji icon for all categories |
| 10 new products | Laptops (3), Headphones (3), Smartwatches (2), Cameras (2) |
| `reviews[]` | 20 reviews across 4 products (5 per product) |
| `productSummaries[]` | Pros, cons, highlights for 4 products |
| `allProducts` | Combined array of all 14 products |
| `getProductById(id)` | Returns one product by ID |
| `getProductsByCategory(cat)` | Filters by category string |
| `searchProducts(query)` | Full-text search across fields |
| `getReviewsByProductId(id)` | Returns reviews for one product |
| `getProductSummary(id)` | Returns pros/cons/highlights |

---

## Updated Components

### Sidebar
- Now uses `NavLink` instead of `<button>` — highlights the active route automatically
- `end` prop on the Home link ensures only `/` exact match triggers active state

### Header
- `useState` for the search query
- `useNavigate` to redirect to `/search?q=...` on Search button click or Enter key

### ProductCard
- Now uses emoji icon (works for all categories, not just phones)
- `showActions` prop — shows ❤ + compare buttons when browsing categories
- Click anywhere on card or title → navigates to `/product/:id`

---

## Tests Added (Sprint 2)

| File | Tests | What it covers |
|------|-------|---------------|
| `Header.test.tsx` | 6 | Updated to wrap in `MemoryRouter` |
| `HeroSection.test.tsx` | 5 | Updated to wrap in `MemoryRouter` |
| `TopReviewedProducts.test.tsx` | 6 | Updated to wrap in `MemoryRouter` |
| `SearchResults.test.tsx` | 6 | Empty state, results, Best Match, no results |
| `Compare.test.tsx` | 5 | Empty state, products added, table, Clear All |
| `Watchlist.test.tsx` | 5 | Empty state, product shown, count display |

**Total: 39 tests passing**

### Why MemoryRouter in tests?
Components that use `useNavigate`, `NavLink`, or `useSearchParams` must be inside a Router. In tests we use `MemoryRouter` (no real browser URL bar needed):

```tsx
render(<MemoryRouter><Header /></MemoryRouter>)

// For pages that read URL params:
render(
  <MemoryRouter initialEntries={['/search?q=iphone']}>
    <Routes><Route path="/search" element={<SearchResults />} /></Routes>
  </MemoryRouter>
)
```

### Resetting Zustand between tests
```tsx
beforeEach(() => {
  useStore.setState({ compareList: [] })
})
```
Without this, state leaks between tests and they fail non-deterministically.
