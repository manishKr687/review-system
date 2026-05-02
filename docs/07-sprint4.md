# 07 — Sprint 4: NLP Pipeline

## What Was Built

Sprint 4 adds an offline NLP pipeline powered by VADER sentiment analysis and keyword-based aspect extraction. A Celery background worker processes all reviews and writes computed sentiment labels and per-product aspect scores back to PostgreSQL. No model training or external API calls are required — the entire pipeline runs self-contained in Docker.

---

## New File Structure

```
backend/
├── app/
│   ├── celery_app.py            ← Celery app (Redis broker + backend)
│   ├── tasks/
│   │   └── analysis.py          ← analyse_review / analyse_all_reviews tasks
│   ├── services/
│   │   └── nlp.py               ← VADER sentiment + aspect extraction
│   └── routers/
│       └── analysis.py          ← POST /api/analyse/run, GET /api/analyse/status/:id
│
docker-compose.yml               ← added: worker + flower services
requirements.txt                 ← added: vaderSentiment, celery, flower, psycopg2-binary
```

---

## Running the NLP Pipeline

### Start all services (including Celery worker)
```bash
docker-compose up --build
```

This now starts 5 services:
| Service | Port | Purpose |
|---------|------|---------|
| api | 8000 | FastAPI HTTP server |
| worker | — | Celery background worker |
| flower | 5555 | Celery task monitor (UI) |
| db | 5432 | PostgreSQL |
| redis | 6379 | Message broker + result backend |

### Trigger NLP analysis on all reviews
```bash
curl -X POST http://localhost:8000/api/analyse/run
```

### Poll task progress
```bash
curl http://localhost:8000/api/analyse/status/<task_id>
```

### Monitor tasks visually
```
http://localhost:5555
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/analyse/run` | Kick off full NLP analysis (returns task ID) |
| GET | `/api/analyse/status/:task_id` | Poll status: pending → running → success |

### Example flow
```bash
# 1. Start analysis
POST /api/analyse/run
→ { "task_id": "abc-123", "status": "queued" }

# 2. Poll until done
GET /api/analyse/status/abc-123
→ { "status": "running", "progress": { "done": 1200, "total": 5000 } }

# 3. Final result
→ { "status": "success", "result": { "reviews_processed": 5000, "products_updated": 100 } }
```

---

## NLP Service

`app/services/nlp.py` provides two functions that run entirely offline:

### Sentiment analysis (VADER)

```python
from app.services.nlp import analyse_sentiment

label, score = analyse_sentiment("Battery life is incredible, lasts 2 days!")
# → ("positive", 0.743)
```

VADER compound score thresholds:
- `≥ 0.05` → **positive**
- `≤ −0.05` → **negative**
- Between → **neutral**

### Aspect extraction

```python
from app.services.nlp import extract_aspect_sentiments

aspects = extract_aspect_sentiments("Camera is sharp but battery drains fast")
# → { "camera": 3.8, "battery": 1.6 }
```

How it works:
1. Split review into sentences
2. For each sentence, check which aspect keywords it contains
3. Score that sentence with VADER
4. Average scores per aspect, scaled from `[−1, 1]` to `[1, 5]`

Tracked aspects and sample keywords:

| Aspect | Keywords |
|--------|---------|
| camera | camera, photo, picture, lens, zoom, megapixel, portrait |
| battery | battery, charge, mah, drain, fast charge, endurance |
| performance | speed, lag, processor, cpu, ram, benchmark, smooth |
| display | screen, oled, amoled, resolution, brightness, refresh rate |

Only aspects that are **mentioned** in the review text are included in the result.

---

## Celery Tasks

### `analyse_all_reviews` (batch task)

Located in `app/tasks/analysis.py`. Runs as a background Celery task:

1. Loads all reviews from PostgreSQL via a **synchronous** SQLAlchemy session
2. Runs VADER sentiment on every review body → updates `review.sentiment`
3. Runs aspect extraction → accumulates scores per product
4. After all reviews: recomputes `product.aspects` JSON as the weighted average of sentence-level scores
5. Commits everything in one transaction

Reports progress state (visible in Flower + via status endpoint):
```python
self.update_state(state="PROGRESS", meta={"done": i, "total": total})
```

### `analyse_review` (single-review task)

Can be triggered per-review for incremental updates:
```python
from app.tasks.analysis import analyse_review
analyse_review.delay(review_id=42)
```

---

## Celery + Database Design

Celery tasks are **synchronous** (they run in a thread pool, not an async event loop). To avoid mixing asyncio with Celery, `database.py` provides a separate synchronous engine:

```python
# Async engine (used by FastAPI routers)
engine = create_async_engine(settings.database_url)          # postgresql+asyncpg://

# Sync engine (used by Celery tasks) — driver swapped automatically
_sync_url = settings.database_url.replace("+asyncpg", "")   # postgresql://
sync_engine = create_engine(_sync_url)
SyncSessionLocal = sessionmaker(sync_engine)
```

The worker container receives the same `DATABASE_URL` as the API (`postgresql+asyncpg://`). The `+asyncpg` is stripped at import time to obtain the psycopg2 URL.

---

## Results After First Run

| Metric | Value |
|--------|-------|
| Reviews processed | 5,000 |
| Products updated | 100 |
| Positive reviews | 2,795 (55.9%) |
| Neutral reviews | 1,579 (31.6%) |
| Negative reviews | 626 (12.5%) |

Sample computed aspect scores (real values from the DB):

| Product | camera | battery | performance | display |
|---------|--------|---------|-------------|---------|
| Apple iPhone 15 Pro | 2.38 | 2.0 | 2.0 | 4.8 |
| Apple iPhone 15 | 2.11 | 4.4 | 4.8 | 4.7 |
| Samsung Galaxy S24 Ultra | 2.02 | 2.0 | 2.0 | 4.9 |

---

## Architecture Diagram

```
Browser
  │
  ▼
FastAPI (port 8000)
  ├── POST /api/analyse/run  ──→  Celery task queue (Redis)
  └── GET  /api/analyse/status/:id ──→ Redis result backend
                                          │
                                          ▼
                                   Celery Worker
                                    ├── VADER sentiment per review
                                    ├── Aspect keyword extraction
                                    └── UPDATE products SET aspects = ...
                                          │
                                          ▼
                                      PostgreSQL

Flower (port 5555) ──→ monitors Celery workers + task history
```

---

## Why VADER (not a transformer model)?

| Criterion | VADER | BERT/RoBERTa |
|-----------|-------|-------------|
| Setup | `pip install vaderSentiment` | Download 400 MB+ model |
| Inference speed | ~1 ms/review | ~50–200 ms/review (CPU) |
| Docker image size | No change | +1–2 GB |
| Accuracy on product reviews | Good (~80–85%) | Excellent (~90–94%) |
| Requires GPU | No | Recommended |

VADER is the right choice for a self-hosted demo without GPU. The architecture is model-agnostic — swapping in a transformer only requires changing `analyse_sentiment()` in `nlp.py`.

---

## What's Next

- **Sprint 5** — Admin Panel: add/edit products and re-trigger analysis from a UI
- **Sprint 6** — Real data import from Kaggle dataset
- **Sprint 7** — Recommendation engine based on aspect similarity
