from sqlalchemy import JSON, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    brand: Mapped[str] = mapped_column(String(100), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    rating: Mapped[float] = mapped_column(Float, nullable=False)
    review_count: Mapped[int] = mapped_column(Integer, default=0)
    icon: Mapped[str] = mapped_column(String(10), default="📦")
    quote: Mapped[str] = mapped_column(String(500), default="")
    aspects: Mapped[dict] = mapped_column(JSON, default=dict)
    pros: Mapped[list] = mapped_column(JSON, default=list)
    cons: Mapped[list] = mapped_column(JSON, default=list)
    highlights: Mapped[list] = mapped_column(JSON, default=list)
    scores: Mapped[dict] = mapped_column(JSON, default=dict)
    composite_score: Mapped[float] = mapped_column(Float, default=0.0, index=True)

    reviews: Mapped[list["Review"]] = relationship(back_populates="product", lazy="select")
