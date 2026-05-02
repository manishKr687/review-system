# ReviewLens — Project Sprint Plan

> **Platform:** AI-powered product review discovery. No purchasing. Only review exploration, comparison, and recommendations.

---

## Tech Stack

### Frontend
| Layer        | Technology              | Version  |
|--------------|-------------------------|----------|
| Framework    | React + TypeScript      | 18.x     |
| Build Tool   | Vite                    | 5.x      |
| Styling      | Tailwind CSS            | 3.x      |
| Icons        | Lucide React            | latest   |
| Charts       | Recharts                | 2.x      |
| Routing      | React Router            | v6       |
| State        | Zustand                 | 4.x      |

### Backend
| Layer        | Technology              | Version  |
|--------------|-------------------------|----------|
| Framework    | FastAPI (Python)        | 0.110+   |
| Server       | Uvicorn (ASGI)          | latest   |
| ORM          | SQLAlchemy + Alembic    | 2.x      |
| Validation   | Pydantic v2             | built-in |
| NLP          | spaCy + VADER / HuggingFace | latest |
| Task Queue   | Celery + Redis          | 5.x      |

### Database & Infrastructure
| Layer        | Technology              | Purpose                          |
|--------------|-------------------------|----------------------------------|
| Primary DB   | PostgreSQL              | Products, reviews, scores        |
| Cache        | Redis                   | Search cache, sessions, trending |
| Search       | pgvector                | Semantic product search          |
| Containers   | Docker + Docker Compose | Local dev environment            |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│   Dashboard | Product Detail | Compare | Category | Search   │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API (JSON)
┌────────────────────────▼────────────────────────────────────┐
│                     FastAPI Backend                          │
│   /products  /search  /recommendations  /reviews  /summary   │
└──────┬──────────────────────────┬───────────────────────────┘
       │                          │
┌──────▼──────┐          ┌────────▼────────┐
│ PostgreSQL  │          │  Redis Cache    │
│  Products   │          │  Search < 300ms │
│  Reviews    │          │  Trending data  │
│  Scores     │          └─────────────────┘
└─────────────┘
       │
┌──────▼──────────────────────────────────────────────────────┐
│                  Celery Worker (NLP Pipeline)                │
│   Sentiment Analysis | Aspect Extraction | Score Compute     │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema (Overview)

```
products          reviews               aspect_scores
─────────         ───────               ─────────────
id                id                    id
name              product_id (FK)       product_id (FK)
category          user_id (FK)          aspect_name
brand             rating                score
price_range       text                  review_count
specs (JSONB)     sentiment_score
overall_score     is_verified
review_count      helpful_votes
created_at        created_at

users             review_summaries
─────             ────────────────
id                id
username          product_id (FK)
email             pros (JSONB array)
watchlist         cons (JSONB array)
history           highlights (JSONB)
created_at        generated_at
```

---

## API Endpoints (Overview)

| Method | Endpoint                        | Description                          |
|--------|---------------------------------|--------------------------------------|
| GET    | /products/search                | Search with filters (q, category, price) |
| GET    | /products/:id                   | Full product details + specs         |
| GET    | /products/:id/reviews           | Paginated review list                |
| GET    | /products/:id/summary           | AI-generated pros/cons/highlights    |
| GET    | /products/:id/aspects           | Aspect-wise scores (camera, battery) |
| GET    | /recommendations                | type=top/value/trending/usecase      |
| GET    | /categories                     | All categories with counts           |
| POST   | /reviews                        | Submit a new review                  |
| GET    | /compare?ids=1,2,3              | Side-by-side product comparison      |

---

## Sprint 1 — UI Foundation & Static Dashboard
**Duration:** Week 1 (5 days)
**Goal:** Pixel-perfect static dashboard matching the design mockup

### Tasks
- [ ] Scaffold Vite + React + TypeScript project
- [ ] Configure Tailwind CSS + PostCSS
- [ ] Install dependencies (Lucide, Recharts, React Router, Zustand)
- [ ] Build layout system
  - [ ] Sidebar (logo, nav items, My Activity, Share card)
  - [ ] Header (search bar, Write a Review, notifications, user)
  - [ ] 3-column layout (sidebar | main | right panel)
- [ ] Build main content components
  - [ ] Hero section (product image, overall rating, aspect bars)
  - [ ] Category pills (Smartphones, Laptops, Headphones, etc.)
  - [ ] Top Reviewed Products section
    - [ ] Tab group (Overall Best, Best Value, Top Rated, Trending)
    - [ ] Product cards (rank badge, image, stars, quote, review count)
    - [ ] Filters panel
  - [ ] Review Insights stats bar (totals, sentiment %, products compared)
- [ ] Build right panel components
  - [ ] Review Summary (overall rating, star distribution bars)
  - [ ] What People Love (checkmarks)
  - [ ] Recently Analyzed (product thumbnails)
- [ ] Create mock data layer (products, reviews, categories, scores)

**Deliverable:** Fully functional static dashboard UI

---

## Sprint 2 — Navigation & Inner Pages
**Duration:** Week 2 (5 days)
**Goal:** Complete navigable frontend with all pages wired to mock data

### Tasks
- [ ] Set up React Router v6 (routes + layouts)
- [ ] Product Detail Page
  - [ ] Hero (image, name, overall rating, price range)
  - [ ] Aspect score breakdown (bars/chart per feature)
  - [ ] Pros & Cons panel
  - [ ] Review list (paginated, with user, date, rating, text)
  - [ ] Review highlights
  - [ ] Trust indicators (verified badge, helpful votes)
- [ ] Category Browse Page
  - [ ] Grid of product cards
  - [ ] Filter sidebar (price range, rating, features)
  - [ ] Sort options (rating, trending, recency)
- [ ] Compare Page
  - [ ] Add up to 4 products to compare
  - [ ] Side-by-side aspect scores table
  - [ ] Pros/cons per product
  - [ ] Overall winner indicator
- [ ] Search Results Page
  - [ ] Results grid with filters
  - [ ] "Best match" highlighted
  - [ ] Natural language query support (UI only)
- [ ] Watchlist / Bookmarks Page (UI shell)
- [ ] Zustand store for compare list, filters, watchlist

**Deliverable:** Fully navigable multi-page frontend with mock data

---

## Sprint 3 — Backend API
**Duration:** Week 3 (5 days)
**Goal:** Working FastAPI backend connected to real PostgreSQL database

### Tasks
- [ ] Project setup
  - [ ] FastAPI project structure (routers, models, schemas, services)
  - [ ] Docker Compose (FastAPI + PostgreSQL + Redis)
  - [ ] Alembic migrations
- [ ] Database
  - [ ] Create all tables (products, reviews, aspect_scores, users, summaries)
  - [ ] Seed script: 100 products, 5000+ reviews across categories
- [ ] API implementation
  - [ ] `GET /products/search` — full-text search + filters + pagination
  - [ ] `GET /products/:id` — product details
  - [ ] `GET /products/:id/reviews` — paginated reviews
  - [ ] `GET /products/:id/aspects` — aspect scores
  - [ ] `GET /recommendations` — type-based (top/value/trending)
  - [ ] `GET /categories` — list with review counts
  - [ ] `POST /reviews` — submit review
  - [ ] `GET /compare` — multi-product comparison data
- [ ] Redis caching
  - [ ] Cache search results (TTL: 5 min)
  - [ ] Cache recommendations (TTL: 15 min)
  - [ ] Cache product details (TTL: 10 min)
- [ ] CORS configuration for frontend
- [ ] Replace all frontend mock data with real API calls

**Deliverable:** Full-stack app with real data, sub-300ms responses

---

## Sprint 4 — NLP & Review Intelligence
**Duration:** Week 4 (5 days)
**Goal:** AI-powered review analysis live in the UI

### Tasks
- [ ] NLP pipeline setup
  - [ ] Install spaCy, VADER, HuggingFace transformers
  - [ ] Celery worker setup (async task processing)
- [ ] Sentiment analysis
  - [ ] Per-review sentiment score (positive / negative / neutral)
  - [ ] Aggregate product-level sentiment score
  - [ ] Confidence threshold for reliability
- [ ] Aspect extraction
  - [ ] Define aspects: battery, camera, display, performance, value, build
  - [ ] Extract aspect mentions from review text (NER / keyword matching)
  - [ ] Assign sentiment to each aspect mention
  - [ ] Compute weighted aspect scores per product
- [ ] Summary generation
  - [ ] Extract top positive phrases → Pros
  - [ ] Extract top negative phrases → Cons
  - [ ] Pick 3–5 review highlights (most helpful + high sentiment)
- [ ] Precompute pipeline
  - [ ] Run on all seeded reviews at startup
  - [ ] Re-run on new review submission (async Celery task)
- [ ] `GET /products/:id/summary` endpoint live with NLP data
- [ ] Wire NLP data into Product Detail UI (pros, cons, highlights)

**Deliverable:** AI-generated review insights visible throughout the app

---

## Sprint 5 — Recommendation Engine
**Duration:** Week 5 (5 days)
**Goal:** Smart, real recommendations in all dashboard sections

### Tasks
- [ ] Ranking formula implementation
  ```
  score = (0.35 × avg_rating)
        + (0.25 × sentiment_score)
        + (0.20 × credibility_score)   ← verified reviews + helpful votes
        + (0.20 × recency_score)       ← weighted by review date
  ```
- [ ] Recommendation sections
  - [ ] **Top Rated** — highest composite score overall
  - [ ] **Best Value** — high score + lower price range
  - [ ] **Trending** — score velocity (score growth in last 30 days)
  - [ ] **Best for Gaming** — high performance + display aspect score
  - [ ] **Best for Photography** — high camera aspect score
  - [ ] **Best for Travel** — high battery + build score
- [ ] Natural language search ranking
  - [ ] Parse "best phone under 30000" → extract category + price filter
  - [ ] Rank results by composite score within constraints
- [ ] Precompute all recommendation lists (nightly Celery task)
- [ ] Redis cache all recommendation endpoints
- [ ] Wire into frontend:
  - [ ] Dashboard tab group (Overall Best, Best Value, Top Rated, Trending)
  - [ ] "Best for [use-case]" section on homepage
  - [ ] Search result ranking

**Deliverable:** All recommendation sections populated with smart rankings

---

## Sprint 6 — Polish, Optional Features & Production Readiness
**Duration:** Week 6 (5 days)
**Goal:** Production-ready MVP with optional features

### Tasks
- [ ] User accounts (optional)
  - [ ] Registration / login (JWT)
  - [ ] Watchlist / bookmarks (save products)
  - [ ] Personalized "Recommended for You" based on view history
- [ ] Fake review detection
  - [ ] Flag reviews with suspiciously short text
  - [ ] Detect review spikes (sudden burst from new accounts)
  - [ ] Downweight flagged reviews in score calculation
- [ ] "Explain this recommendation" feature
  - [ ] Per-product explanation card (why it's ranked #1)
  - [ ] Aspect breakdown shown in plain language
- [ ] Performance
  - [ ] Lighthouse score ≥ 90 (performance, accessibility)
  - [ ] All API responses < 300ms (with cache)
  - [ ] Lazy loading for product images
  - [ ] Infinite scroll for review lists
- [ ] Responsive design
  - [ ] Mobile layout (collapsible sidebar, stacked cards)
  - [ ] Tablet layout
- [ ] Error handling
  - [ ] Empty states (no results, failed search)
  - [ ] Loading skeletons for all data-fetching components
  - [ ] API error boundaries
- [ ] Final QA pass across all pages and flows

**Deliverable:** Production-ready ReviewLens MVP

---

## Timeline Summary

| Sprint | Focus                         | Duration | End of Week |
|--------|-------------------------------|----------|-------------|
| 1      | UI Foundation & Dashboard     | 5 days   | Week 1      |
| 2      | Navigation & Inner Pages      | 5 days   | Week 2      |
| 3      | Backend API + Database        | 5 days   | Week 3      |
| 4      | NLP & Review Intelligence     | 5 days   | Week 4      |
| 5      | Recommendation Engine         | 5 days   | Week 5      |
| 6      | Polish & Production Readiness | 5 days   | Week 6      |

**Total:** 6 weeks to production-ready MVP

---

## Non-Functional Requirements

| Requirement      | Target                                |
|------------------|---------------------------------------|
| Search latency   | < 300ms (with Redis cache)            |
| API uptime       | 99.9%                                 |
| Review scale     | Supports 1M+ reviews                 |
| NLP processing   | Async, does not block API responses   |
| Fake review safe | Statistical outlier detection         |
| No purchasing    | Zero cart / checkout / payment code   |

---

## Definition of Done (per Sprint)

- All tasks in the sprint checklist are completed
- No TypeScript errors (`tsc --noEmit` passes)
- No console errors in the browser
- All API endpoints return correct responses
- UI matches the approved design mockup
- Code is committed and pushed to the main branch
