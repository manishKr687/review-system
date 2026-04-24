from pydantic import BaseModel


class AspectScores(BaseModel):
    camera: float = 0
    battery: float = 0
    performance: float = 0
    display: float = 0
    audio: float = 0
    build: float = 0
    value: float = 0


class ProductBase(BaseModel):
    id: int
    name: str
    brand: str
    category: str
    price: float
    rating: float
    review_count: int
    icon: str
    quote: str
    aspects: dict
    pros: list[str]
    cons: list[str]
    highlights: list[str]

    model_config = {"from_attributes": True}


class ProductList(BaseModel):
    id: int
    name: str
    brand: str
    category: str
    price: float
    rating: float
    review_count: int
    icon: str
    quote: str
    aspects: dict

    model_config = {"from_attributes": True}


class ProductsResponse(BaseModel):
    total: int
    products: list[ProductList]
