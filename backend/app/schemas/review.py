from pydantic import BaseModel


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

    model_config = {"from_attributes": True}


class ReviewsResponse(BaseModel):
    total: int
    reviews: list[ReviewOut]
