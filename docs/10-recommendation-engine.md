# Sprint 6 — Recommendation Engine

## Overview

Adds a data-driven recommendation engine that scores every product using a composite formula and exposes a `/api/recommendations` endpoint consumed by the frontend.

## Scoring Formula

Each product receives five pre-computed scores stored in a `scores` JSON column:

| Score | Formula | Weight in composite |
|-------|---------|---------------------|
| `composite` | Weighted blend of all signals | — |
| `sentiment` | `positive_reviews / total_reviews` | 25 % |
| `credibility` | `0.6 × verified_pct + 0.4 × helpful_norm` | 20 % |
| `recency` | `recent_reviews / total_reviews` (last 90 days) | 20 % |
| `value` | `composite / log₂(price + 2)` normalised | — |

Composite:
```
composite = 0.35 × (rating/5) + 0.25 × sentiment + 0.20 × credibility + 0.20 × recency
```

Scores are computed offline by a Celery task and stored, so the recommendation endpoint is a fast DB sort with no live computation.

## Recommendation Types

| Type | Sort Key |
|------|----------|
| `top_rated` | `scores.composite` |
| `best_value` | `scores.value` |
| `trending` | `0.6 × scores.recency + 0.4 × scores.composite` |
| `gaming` | avg(`aspects.performance`, `aspects.display`) |
| `photography` | `aspects.camera` |
| `travel` | avg(`aspects.battery`, `aspects.build`) |

Use-case types (`gaming`, `photography`, `travel`) rely on VADER aspect scores extracted during the NLP analysis sprint.

## New Files

```
backend/
  alembic/versions/002_add_scores_column.py   migration: adds scores JSON column
  app/services/scoring.py                      composite formula, ReviewStats helper
  app/tasks/scoring.py                         compute_all_scores Celery task
  app/routers/recommendations.py              GET /api/recommendations

src/
  api/products.ts          fetchRecommendations() + RecommendationType
  hooks/useProducts.ts     useRecommendations() hook (dual-mode)
  components/BestForSection.tsx  Photography / Gaming / Travel use-case cards
```

## API

### `GET /api/recommendations`

Query params:

| Param | Default | Description |
|-------|---------|-------------|
| `type` | `top_rated` | One of the six recommendation types |
| `category` | — | Optional category filter |
| `limit` | `8` | Max results |

Returns `list[ProductList]`. Cached for 600 s.

### `POST /api/admin/compute-scores`

Queues the `compute_all_scores` Celery task. Requires `x-admin-key` header. Returns `{task_id, status}`. Poll `GET /api/analyse/status/{task_id}` for progress.

## Running Score Computation

```bash
# Initial setup after seeding
curl -X POST http://localhost:8000/api/admin/compute-scores \
  -H "x-admin-key: reviewlens-admin"

# Poll status
curl http://localhost:8000/api/analyse/status/<task_id>
# {"status":"success","result":{"products_scored":100,"total_products":100}}
```

## Frontend Components

### `TopReviewedProducts`

Uses `useRecommendations(type, 8)` per tab. Tabs map to:
- Overall Best → `top_rated`
- Best Value → `best_value`
- Top Rated → `top_rated`
- Trending → `trending`

### `BestForSection`

Three use-case cards on the home page:

| Card | Type | Icon |
|------|------|------|
| Best for Photography | `photography` | Camera |
| Best for Gaming | `gaming` | Gamepad |
| Best for Travel | `travel` | Plane |

Each card shows the top 3 products with rank badges and star ratings, navigating to the product detail page on click.
