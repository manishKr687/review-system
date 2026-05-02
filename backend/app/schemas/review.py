from pydantic import BaseModel, Field


class ReviewCreate(BaseModel):
    author: str = Field(..., min_length=1, max_length=100)
    rating: float = Field(..., ge=1, le=5)
    title: str = Field("", max_length=200)
    body: str = Field(..., min_length=10)


class ReviewOut(BaseModel):
    id: int
    product_id: int
    author: str
    rating: float
    title: str
    body: str
    sentiment: str
    verified: bool
    helpful: int
    date: str
    is_suspicious: bool = False

    model_config = {"from_attributes": True}


class ReviewsResponse(BaseModel):
    total: int
    reviews: list[ReviewOut]
