from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False, index=True)
    author: Mapped[str] = mapped_column(String(100), nullable=False)
    rating: Mapped[float] = mapped_column(Float, nullable=False)
    title: Mapped[str] = mapped_column(String(200), default="")
    body: Mapped[str] = mapped_column(Text, nullable=False)
    sentiment: Mapped[str] = mapped_column(String(20), default="neutral")  # positive | negative | neutral
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    helpful: Mapped[int] = mapped_column(Integer, default=0)
    date: Mapped[str] = mapped_column(String(20), default="")
    is_suspicious: Mapped[bool] = mapped_column(Boolean, default=False)
    reviewer_ip: Mapped[str | None] = mapped_column(String(45), nullable=True, index=True)

    product: Mapped["Product"] = relationship(back_populates="reviews")
