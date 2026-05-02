# Sprint 7 — Polish

## Overview

Three focused improvements: responsive layout, fake review detection, and recommendation explanations.

---

## 1. Responsive Design

Previously the entire UI was fixed-width desktop-only. This sprint adds full mobile/tablet support.

### Changes

| Component | Change |
|-----------|--------|
| `Layout.tsx` | Holds `sidebarOpen` state; renders mobile backdrop overlay |
| `Sidebar.tsx` | Accepts `isOpen`/`onClose` props; `fixed` positioned on mobile, `static` on `lg+`; slides in/out via `translate-x` |
| `Header.tsx` | Accepts `onMenuClick`; shows hamburger on `<lg`; collapses "Write a Review" and username on small screens |
| `HeroSection.tsx` | Stacks vertically on mobile; hides phone illustration on `xs` |
| `TopReviewedProducts` | `grid-cols-2 lg:grid-cols-4` |
| `BestForSection` | `grid-cols-1 md:grid-cols-3` |
| `ReviewInsights` | `grid-cols-2 md:grid-cols-4` |
| `CategoryBrowse` | Filter sidebar stacks above product grid on mobile; grid `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3` |
| `ProductDetail` | Pros/cons `grid-cols-1 sm:grid-cols-2` |
| `Home.tsx` | Right summary panel hidden below `xl` breakpoint |

---

## 2. Fake Review Detection

Heuristic NLP detector flags suspicious reviews at analysis time.

### Signals detected

| Signal | Rule |
|--------|------|
| Too short | < 8 words |
| All-caps | > 60 % of alphabetic chars are uppercase |
| Hyperbolic short | < 20 words **and** `|VADER compound| > 0.95` |
| Star/sentiment mismatch | ≥ 4.5 stars with clearly negative text (compound < −0.4) |
| Star/sentiment mismatch | ≤ 2.0 stars with clearly positive text (compound > 0.4) |

### Backend

- `Review.is_suspicious` boolean column (migration `003`)
- `nlp.detect_suspicious(text, rating) → bool` in `app/services/nlp.py`
- `analyse_all_reviews` and `analyse_review` tasks now set the flag
- `ReviewOut` schema exposes `is_suspicious`

After running `POST /api/admin/analyse`, **512 / 5 000 reviews** (~10 %) were flagged.

### Frontend

Reviews flagged as suspicious show an amber **Suspicious** badge beside the author name on the Product Detail page. The badge has a tooltip: *"Our AI flagged this review as potentially unreliable"*.

---

## 3. Recommendation Explanations

Each `ProductCard` now shows a **"Why?"** button when the product has computed scores (i.e. when the app is connected to the API). Clicking it expands an inline panel:

```
Why recommended
Overall fit   ████████░░  84%
Sentiment     ████████░░  80%
Credibility   █████████░  92%
Recency       ██░░░░░░░░  20%
Value         █████████░  88%
```

### Backend

`ProductList` schema now includes `scores: dict = {}` so every list/recommendation endpoint returns precomputed scores.

### Frontend

- `RecommendationScores` interface added to `src/api/types.ts` and `src/data/mockData.ts`
- `adaptProduct()` in `useProducts.ts` maps `p.scores`
- `ProductCard` receives scores, renders `ScoreBar` sub-component per dimension
- Toggle via local `showScores` state — no extra API calls

---

## Running

No extra setup needed. The suspicious flags and scores are populated by the existing admin tasks:

```bash
# Re-run NLP to populate is_suspicious
curl -X POST http://localhost:8000/api/admin/analyse -H "x-admin-key: reviewlens-admin"

# Re-run scoring if needed
curl -X POST http://localhost:8000/api/admin/compute-scores -H "x-admin-key: reviewlens-admin"
```
