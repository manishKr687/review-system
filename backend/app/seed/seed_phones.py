"""
Inserts the 7 real phone products.
Run: docker-compose exec api python -m app.seed.seed_phones
"""
import asyncio

from app.database import AsyncSessionLocal
from app.models.product import Product

PHONES = [
    {
        "name": "Samsung Galaxy S26",
        "brand": "Samsung",
        "category": "Phones",
        "price": 79999,
        "icon": "📱",
        "quote": "Flagship-class Android with AI-tuned camera suite.",
        "aspects": {"camera": 4.7, "battery": 4.5, "performance": 4.8, "display": 4.8, "audio": 4.5, "build": 4.6, "value": 4.3},
        "pros": ["Excellent camera", "powerful performance", "bright 120Hz AMOLED"],
        "cons": ["Expensive", "software feels heavy", "no charger in box"],
        "highlights": ["Snapdragon 8 Elite-class chip", "AI camera suite", "120 Hz AMOLED"],
    },
    {
        "name": "Vivo X300 Ultra",
        "brand": "Vivo",
        "category": "Phones",
        "price": 95999,
        "icon": "📱",
        "quote": "Photography-first flagship with 200 MP main camera.",
        "aspects": {"camera": 4.9, "battery": 4.6, "performance": 4.7, "display": 4.6, "audio": 4.4, "build": 4.5, "value": 4.2},
        "pros": ["Dual 200 MP main cameras", "large 7000 mAh battery", "100 W fast charging"],
        "cons": ["Heavy and bulky", "camera-heavy focus", "premium price"],
        "highlights": ["Dual 200 MP main cameras", "7000 mAh battery with 100 W charging", "telephoto-focused camera setup"],
    },
    {
        "name": "OnePlus 15R 5G",
        "brand": "OnePlus",
        "category": "Phones",
        "price": 44999,
        "icon": "📱",
        "quote": "Performance-oriented mid-flagship with smooth 120Hz display.",
        "aspects": {"camera": 4.5, "battery": 4.7, "performance": 4.7, "display": 4.7, "audio": 4.5, "build": 4.4, "value": 4.6},
        "pros": ["Strong performance", "120 Hz AMOLED", "8300 mAh battery"],
        "cons": ["Camera lags behind flagships", "limited software customization options"],
        "highlights": ["Snapdragon 8 Elite-class chip", "120 Hz AMOLED", "8300 mAh battery with fast charging"],
    },
    {
        "name": "Motorola Edge 70 5G",
        "brand": "Motorola",
        "category": "Phones",
        "price": 29990,
        "icon": "📱",
        "quote": "Slim 5G mid-ranger with clean Android and solid battery.",
        "aspects": {"camera": 4.4, "battery": 4.6, "performance": 4.5, "display": 4.5, "audio": 4.5, "build": 4.3, "value": 4.5},
        "pros": ["Clean Android experience", "slim design", "decent battery life"],
        "cons": ["Average camera vs rivals", "fewer premium features"],
        "highlights": ["Snapdragon 7 Gen4", "120 Hz AMOLED", "clean Android 15"],
    },
    {
        "name": "Apple iPhone 18",
        "brand": "Apple",
        "category": "Phones",
        "price": 149900,
        "icon": "📱",
        "quote": "Next-gen iPhone with variable-aperture camera and iOS 27 AI.",
        "aspects": {"camera": 4.9, "battery": 4.5, "performance": 4.8, "display": 4.7, "audio": 4.6, "build": 4.8, "value": 4.1},
        "pros": ["Excellent camera", "smooth performance", "strong ecosystem"],
        "cons": ["Very expensive", "no charger in box", "limited customization"],
        "highlights": ["A20 Pro-class chip", "variable-aperture main camera", "iOS 27 with advanced AI features"],
    },
    {
        "name": "Redmi Note 16 Pro",
        "brand": "Xiaomi",
        "category": "Phones",
        "price": 19999,
        "icon": "📱",
        "quote": "Budget-friendly phone with 120 Hz AMOLED and large battery.",
        "aspects": {"camera": 4.3, "battery": 4.6, "performance": 4.4, "display": 4.5, "audio": 4.2, "build": 4.3, "value": 4.7},
        "pros": ["Great value", "120 Hz AMOLED", "5500-6000 mAh battery"],
        "cons": ["Camera not on par with flagships", "plastic build feels less premium"],
        "highlights": ["Snapdragon 7s-class chip", "120 Hz AMOLED", "5500-6000 mAh battery"],
    },
    {
        "name": "Google Pixel 11 Pro",
        "brand": "Google",
        "category": "Phones",
        "price": 89999,
        "icon": "📸",
        "quote": "AI-first Android with computational photography and clean software.",
        "aspects": {"camera": 4.8, "battery": 4.4, "performance": 4.7, "display": 4.7, "audio": 4.5, "build": 4.5, "value": 4.3},
        "pros": ["Best-in-class camera for HDR and low-light", "super clean Android 16"],
        "cons": ["Limited global availability", "average battery life"],
        "highlights": ["Tensor G5-class chip", "AI-enhanced camera", "Android 16 with Material You"],
    },
]


async def seed() -> None:
    async with AsyncSessionLocal() as db:
        for data in PHONES:
            product = Product(
                name=data["name"],
                brand=data["brand"],
                category=data["category"],
                price=data["price"],
                icon=data["icon"],
                quote=data["quote"],
                aspects=data["aspects"],
                pros=data["pros"],
                cons=data["cons"],
                highlights=data["highlights"],
                rating=0.0,
                review_count=0,
                scores={},
            )
            db.add(product)
        await db.commit()
        print(f"Inserted {len(PHONES)} phones.")


if __name__ == "__main__":
    asyncio.run(seed())
