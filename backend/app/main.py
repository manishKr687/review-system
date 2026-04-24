from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import categories, products, reviews, search


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(title="ReviewLens API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:4173"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(categories.router, prefix="/api/categories", tags=["categories"])


@app.get("/api/health")
async def health():
    return {"status": "ok"}
