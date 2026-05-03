"""
Adds 2026 smartphone launches to the database without touching existing data.
Run: docker-compose exec api python -m app.seed.seed_2026_phones
"""
import asyncio
import random
from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy import text

from app.database import AsyncSessionLocal
from app.models.product import Product
from app.models.review import Review

random.seed(2026)

PHONES_2026 = [
    # ── Samsung Galaxy S26 series (January 2026) ─────────────────────────────
    {
        "name": "Samsung Galaxy S26 Ultra",
        "brand": "Samsung", "category": "Phones", "price": 1299, "icon": "📱",
        "aspects": {"camera": 5.0, "battery": 4.7, "performance": 4.9, "display": 4.9, "audio": 0, "build": 4.8, "value": 4.1},
        "quote": "Galaxy AI 2.0 and a 200MP camera redefine mobile photography",
        "pros": ["Exceptional Camera", "Exceptional Performance", "Exceptional Display"],
        "cons": ["Premium price point"],
        "highlights": ["200MP quad-camera system", "Galaxy AI 2.0 on-device", "Snapdragon 8 Elite 2", "Titanium frame"],
        "launch": "2026-01-22",
    },
    {
        "name": "Samsung Galaxy S26+",
        "brand": "Samsung", "category": "Phones", "price": 999, "icon": "📱",
        "aspects": {"camera": 4.8, "battery": 4.6, "performance": 4.9, "display": 4.8, "audio": 0, "build": 4.7, "value": 4.3},
        "quote": "Big screen performance with AI that actually understands you",
        "pros": ["Exceptional Performance", "Exceptional Battery life"],
        "cons": ["Average value for money"],
        "highlights": ["6.7-inch Dynamic AMOLED", "Snapdragon 8 Elite 2", "45W fast charging", "Galaxy AI 2.0"],
        "launch": "2026-01-22",
    },
    {
        "name": "Samsung Galaxy S26",
        "brand": "Samsung", "category": "Phones", "price": 799, "icon": "📱",
        "aspects": {"camera": 4.6, "battery": 4.5, "performance": 4.8, "display": 4.7, "audio": 0, "build": 4.6, "value": 4.5},
        "quote": "The right amount of everything in a perfect-sized package",
        "pros": ["Exceptional Performance"],
        "cons": ["Average value for money"],
        "highlights": ["50MP triple camera", "Snapdragon 8 Elite 2", "IP68 rated", "Galaxy AI 2.0"],
        "launch": "2026-01-22",
    },

    # ── OnePlus 14 (January 2026) ─────────────────────────────────────────────
    {
        "name": "OnePlus 14",
        "brand": "OnePlus", "category": "Phones", "price": 799, "icon": "📱",
        "aspects": {"camera": 4.6, "battery": 4.9, "performance": 4.9, "display": 4.8, "audio": 0, "build": 4.7, "value": 4.8},
        "quote": "100W SUPERVOOC and Hasselblad cameras at a flagship-killer price",
        "pros": ["Exceptional Battery life", "Exceptional Performance"],
        "cons": ["Average camera vs ultra-flagships"],
        "highlights": ["Hasselblad-tuned cameras", "100W SUPERVOOC charging", "50W wireless", "Snapdragon 8 Elite 2"],
        "launch": "2026-01-23",
    },

    # ── Xiaomi 15 Ultra (February 2026) ──────────────────────────────────────
    {
        "name": "Xiaomi 15 Ultra",
        "brand": "Xiaomi", "category": "Phones", "price": 1149, "icon": "📱",
        "aspects": {"camera": 4.9, "battery": 4.8, "performance": 4.9, "display": 4.8, "audio": 0, "build": 4.6, "value": 4.5},
        "quote": "Leica Summilux quad-camera with 120W HyperCharge",
        "pros": ["Exceptional Camera", "Exceptional Battery life", "Exceptional Performance"],
        "cons": ["Average build vs Samsung Ultra"],
        "highlights": ["1-inch main sensor with Leica optics", "120W HyperCharge", "Snapdragon 8 Elite 2", "5× periscope zoom"],
        "launch": "2026-02-14",
    },

    # ── Samsung Galaxy Z Fold 7 (July 2026) ───────────────────────────────────
    {
        "name": "Samsung Galaxy Z Fold 7",
        "brand": "Samsung", "category": "Phones", "price": 1799, "icon": "📱",
        "aspects": {"camera": 4.7, "battery": 4.5, "performance": 4.9, "display": 4.9, "audio": 0, "build": 4.7, "value": 3.9},
        "quote": "The slimmest foldable ever — Galaxy AI folds with you",
        "pros": ["Exceptional Performance", "Exceptional Display"],
        "cons": ["Premium price point", "Average battery life"],
        "highlights": ["5.1mm thin when folded", "8-inch inner AMOLED", "Snapdragon 8 Elite 2", "S Pen support"],
        "launch": "2026-07-10",
    },

    # ── Samsung Galaxy Z Flip 7 (July 2026) ───────────────────────────────────
    {
        "name": "Samsung Galaxy Z Flip 7",
        "brand": "Samsung", "category": "Phones", "price": 999, "icon": "📱",
        "aspects": {"camera": 4.5, "battery": 4.4, "performance": 4.8, "display": 4.7, "audio": 0, "build": 4.7, "value": 4.2},
        "quote": "4-inch FlexWindow cover display makes this flip truly pocketable",
        "pros": ["Exceptional Performance", "Exceptional Build quality"],
        "cons": ["Average battery life"],
        "highlights": ["4-inch cover display", "Exynos 2500 / Snapdragon 8 Elite 2", "50MP main camera", "Compact foldable"],
        "launch": "2026-07-10",
    },

    # ── Apple iPhone 17 series (September 2026) ───────────────────────────────
    {
        "name": "Apple iPhone 17 Pro Max",
        "brand": "Apple", "category": "Phones", "price": 1199, "icon": "📱",
        "aspects": {"camera": 5.0, "battery": 4.8, "performance": 5.0, "display": 4.9, "audio": 0, "build": 4.9, "value": 4.2},
        "quote": "A19 Pro chip and a 48MP ultrawide make this the definitive pro camera phone",
        "pros": ["Exceptional Camera", "Exceptional Performance", "Exceptional Battery life", "Exceptional Build quality"],
        "cons": ["Premium price point"],
        "highlights": ["A19 Pro chip", "48MP triple-camera system", "6.9-inch ProMotion OLED", "Apple Intelligence 2"],
        "launch": "2026-09-19",
    },
    {
        "name": "Apple iPhone 17 Pro",
        "brand": "Apple", "category": "Phones", "price": 999, "icon": "📱",
        "aspects": {"camera": 4.9, "battery": 4.7, "performance": 5.0, "display": 4.9, "audio": 0, "build": 4.9, "value": 4.3},
        "quote": "Pro-grade power in a perfectly sized titanium body",
        "pros": ["Exceptional Performance", "Exceptional Camera", "Exceptional Build quality"],
        "cons": ["Average value for money"],
        "highlights": ["A19 Pro chip", "ProMotion 6.3-inch OLED", "Apple Intelligence 2", "Titanium design"],
        "launch": "2026-09-19",
    },
    {
        "name": "Apple iPhone 17",
        "brand": "Apple", "category": "Phones", "price": 799, "icon": "📱",
        "aspects": {"camera": 4.8, "battery": 4.6, "performance": 4.9, "display": 4.8, "audio": 0, "build": 4.8, "value": 4.5},
        "quote": "Dynamic Island, ProMotion and Apple Intelligence — now for everyone",
        "pros": ["Exceptional Performance", "Exceptional Camera"],
        "cons": ["Average value for money"],
        "highlights": ["A19 chip", "48MP camera", "ProMotion OLED", "Apple Intelligence 2"],
        "launch": "2026-09-19",
    },
    {
        "name": "Apple iPhone 17 Air",
        "brand": "Apple", "category": "Phones", "price": 899, "icon": "📱",
        "aspects": {"camera": 4.7, "battery": 4.4, "performance": 4.9, "display": 4.8, "audio": 0, "build": 4.9, "value": 4.4},
        "quote": "The thinnest iPhone ever — 5.5mm and impossibly light",
        "pros": ["Exceptional Performance", "Exceptional Build quality"],
        "cons": ["Average battery life"],
        "highlights": ["5.5mm ultra-thin body", "A19 chip", "Single 48MP camera", "Apple Intelligence 2"],
        "launch": "2026-09-19",
    },

    # ── Google Pixel 10 series (October 2026) ─────────────────────────────────
    {
        "name": "Google Pixel 10 Pro",
        "brand": "Google", "category": "Phones", "price": 1099, "icon": "📱",
        "aspects": {"camera": 4.9, "battery": 4.5, "performance": 4.8, "display": 4.8, "audio": 0, "build": 4.6, "value": 4.5},
        "quote": "Tensor G5 and on-device Gemini take AI photography to new heights",
        "pros": ["Exceptional Camera", "Exceptional Performance"],
        "cons": ["Average build vs Apple Pro"],
        "highlights": ["Tensor G5 chip", "On-device Gemini AI", "50MP periscope zoom", "7 years of OS updates"],
        "launch": "2026-10-07",
    },
    {
        "name": "Google Pixel 10",
        "brand": "Google", "category": "Phones", "price": 799, "icon": "📱",
        "aspects": {"camera": 4.8, "battery": 4.5, "performance": 4.7, "display": 4.7, "audio": 0, "build": 4.5, "value": 4.7},
        "quote": "The best stock Android experience with Gemini built in",
        "pros": ["Exceptional Camera"],
        "cons": ["Average build quality"],
        "highlights": ["Tensor G5 chip", "Gemini on-device AI", "50MP camera", "7 years of updates"],
        "launch": "2026-10-07",
    },

    # ── Nothing Phone 3 (March 2026) ──────────────────────────────────────────
    {
        "name": "Nothing Phone 3",
        "brand": "Nothing", "category": "Phones", "price": 699, "icon": "📱",
        "aspects": {"camera": 4.5, "battery": 4.6, "performance": 4.7, "display": 4.6, "audio": 0, "build": 4.7, "value": 4.8},
        "quote": "Glyph Interface 3.0 turns heads while Snapdragon Elite powers your day",
        "pros": ["Exceptional Build quality", "Exceptional Battery life"],
        "cons": ["Average camera vs flagships"],
        "highlights": ["Glyph Interface 3.0", "Snapdragon 8 Elite 2", "50MP triple camera", "Essential Space AI integration"],
        "launch": "2026-03-18",
    },

    # ── Vivo X200 Ultra (March 2026) ─────────────────────────────────────────
    {
        "name": "Vivo X200 Ultra",
        "brand": "Vivo", "category": "Phones", "price": 1099, "icon": "📱",
        "aspects": {"camera": 4.9, "battery": 4.7, "performance": 4.8, "display": 4.8, "audio": 0, "build": 4.6, "value": 4.4},
        "quote": "Zeiss APO lenses and a 1-inch sensor capture what others miss",
        "pros": ["Exceptional Camera", "Exceptional Battery life"],
        "cons": ["Average build quality"],
        "highlights": ["1-inch Zeiss APO main sensor", "200W FlashCharge", "Dimensity 9400", "Professional video modes"],
        "launch": "2026-03-05",
    },
]

# ── Review templates for 2026 phones ────────────────────────────────────────

POSITIVE_REVIEWS = [
    ("Absolutely stunning", "Best smartphone I've ever owned. The camera blows everything else out of the water."),
    ("Next-gen performance", "This thing is blindingly fast. Apps open instantly, gaming is silky smooth."),
    ("AI features actually useful", "For the first time, the AI stuff genuinely saves me time every day."),
    ("Incredible camera system", "Night mode photos look like they were shot on a DSLR. Unbelievable."),
    ("Worth every rupee", "Expensive? Yes. Worth it? Absolutely. You get what you pay for."),
    ("Upgrade well worth it", "Coming from a 2024 flagship, this feels like a generational leap."),
    ("Battery life is insane", "Two days of heavy use on a single charge. Nothing else comes close."),
    ("Build quality is premium", "Feels incredibly solid. The materials and finish are top tier."),
    ("Blazing fast charging", "100% in under 30 minutes — completely changed how I use my phone."),
    ("Display is breathtaking", "Colors are so vivid and the 120Hz refresh makes everything silky."),
]

NEGATIVE_REVIEWS = [
    ("Overpriced", "Marginal upgrades over last year for a much higher price. Not worth it."),
    ("Heating issues", "Gets warm under load. AI features seem to tax the processor heavily."),
    ("Battery not as advertised", "Real-world battery life is well below the claimed numbers."),
    ("Software bugs at launch", "Several crashes in the first week. Needs a few updates to stabilize."),
    ("Disappointed", "Expected more from a 2026 flagship. My old phone does most things just as well."),
]

NEUTRAL_REVIEWS = [
    ("Good but not perfect", "Excellent hardware let down slightly by bloatware. Give it time."),
    ("Solid flagship", "No major complaints. Does everything well, excels at nothing in particular."),
    ("AI is hit or miss", "Some AI features are genuinely clever, others feel gimmicky."),
    ("Great camera, average battery", "The camera is extraordinary but battery life leaves something to be desired."),
]

AUTHORS = [
    "Alex M.", "Jamie T.", "Chris P.", "Sam W.", "Jordan K.", "Taylor R.", "Morgan L.",
    "Casey B.", "Riley N.", "Quinn A.", "Drew H.", "Parker S.", "Avery G.", "Sydney F.",
    "Cameron D.", "Reese O.", "Skyler V.", "Hayden C.", "Dakota Y.", "Blake J.",
    "Kai L.", "River M.", "Sage N.", "Rowan K.", "Finley A.", "Elliot B.", "Dylan T.",
    "Priya S.", "Arjun K.", "Ravi M.", "Neha P.", "Amit G.", "Sunita R.", "Rahul D.",
]


def _review_date(launch_str: str) -> str:
    launch = date.fromisoformat(launch_str)
    today = date(2026, 5, 3)
    if launch > today:
        return today.strftime("%Y-%m-%d")
    delta_days = (today - launch).days
    offset = random.randint(0, min(delta_days, 100))
    return (launch + timedelta(days=offset)).strftime("%Y-%m-%d")


def _make_reviews(product_id: int, launch: str, count: int = 40) -> list[dict]:
    reviews = []
    for _ in range(count):
        roll = random.random()
        if roll < 0.68:
            title, body = random.choice(POSITIVE_REVIEWS)
            sentiment = "positive"
            rating = round(random.uniform(4.0, 5.0), 1)
        elif roll < 0.85:
            title, body = random.choice(NEUTRAL_REVIEWS)
            sentiment = "neutral"
            rating = round(random.uniform(3.0, 4.0), 1)
        else:
            title, body = random.choice(NEGATIVE_REVIEWS)
            sentiment = "negative"
            rating = round(random.uniform(1.5, 3.0), 1)

        reviews.append({
            "product_id": product_id,
            "author": random.choice(AUTHORS),
            "rating": rating,
            "title": title,
            "body": body,
            "sentiment": sentiment,
            "verified": random.random() < 0.55,
            "helpful": random.randint(0, 80),
            "date": _review_date(launch),
            "is_suspicious": False,
        })
    return reviews


async def seed_2026_phones():
    async with AsyncSessionLocal() as session:
        # Sync the PK sequence with the actual max id (explicit-id seeding leaves it at 1)
        await session.execute(
            text("SELECT setval('products_id_seq', (SELECT MAX(id) FROM products))")
        )
        await session.commit()

        # Find existing names so we don't duplicate
        existing_names = set(
            row[0] for row in (await session.execute(select(Product.name))).all()
        )

        added = 0
        for p in PHONES_2026:
            if p["name"] in existing_names:
                print(f"  skip (exists): {p['name']}")
                continue

            aspects = p["aspects"]
            # Compute mean rating from non-zero aspect scores
            nonzero = [v for v in aspects.values() if v > 0]
            rating = round(sum(nonzero) / len(nonzero), 1) if nonzero else 4.0
            review_count = random.randint(80, 4200)

            product = Product(
                name=p["name"],
                brand=p["brand"],
                category=p["category"],
                price=p["price"],
                rating=rating,
                review_count=review_count,
                icon=p["icon"],
                quote=p["quote"],
                aspects=aspects,
                pros=p.get("pros", []),
                cons=p.get("cons", ["Premium price point"]),
                highlights=p.get("highlights", []),
            )
            session.add(product)
            await session.flush()  # get product.id

            for rv in _make_reviews(product.id, p["launch"]):
                session.add(Review(**rv))

            added += 1
            print(f"  + {p['name']}  (id={product.id}, rating={rating})")

        await session.commit()
        print(f"\n✓ Added {added} new 2026 phones with {added * 40} reviews each")


if __name__ == "__main__":
    asyncio.run(seed_2026_phones())
