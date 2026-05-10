"""
Downloads real phone images from Wikipedia and saves them to the frontend's
public/images/phones/ folder, then updates image_url in the database.

Run ONCE after seeding real phones:
    docker-compose exec api python -m app.seed.download_phone_images
"""
import asyncio
import os
import urllib.request
import urllib.parse
import json
import re

from app.database import AsyncSessionLocal
from app.models.product import Product
from sqlalchemy import select

# ── Wikipedia article title for each phone model ─────────────────────────────
WIKI_TITLES: dict[str, str] = {
    "Samsung Galaxy S25 Ultra":   "Samsung Galaxy S25",
    "Samsung Galaxy S25+":        "Samsung Galaxy S25",
    "Samsung Galaxy S25":         "Samsung Galaxy S25",
    "Apple iPhone 16 Pro Max":    "IPhone 16 Pro",
    "Apple iPhone 16 Pro":        "IPhone 16 Pro",
    "Apple iPhone 16":            "IPhone 16",
    "Xiaomi 15 Ultra":            "Xiaomi 15 Ultra",
    "OnePlus 13":                 "OnePlus 13",
    "OnePlus 13R":                "OnePlus 13R",
    "Google Pixel 9 Pro XL":      "Google Pixel 9",
    "Google Pixel 9":             "Google Pixel 9",
    "Vivo X200 Pro":              "Vivo X200 Pro",
    "iQOO 13":                    "IQOO 13",
    "Realme GT 7 Pro":            "Realme GT 7 Pro",
    "Motorola Edge 50 Pro":       "Motorola Edge 50",
    "Nothing Phone (3a)":         "Nothing Phone (3a)",
    "Redmi Note 14 Pro+ 5G":      "Redmi Note 14 Pro+",
}

# Path to the frontend public directory (relative to this script)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.normpath(os.path.join(SCRIPT_DIR, "../../../../src/../public/images/phones"))


def _safe_filename(name: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-') + ".jpg"


def _fetch_wiki_image_url(title: str, thumb_size: int = 600) -> str | None:
    params = urllib.parse.urlencode({
        "action": "query",
        "titles": title,
        "prop": "pageimages",
        "format": "json",
        "pithumbsize": thumb_size,
        "redirects": 1,
    })
    api_url = f"https://en.wikipedia.org/w/api.php?{params}"
    try:
        req = urllib.request.Request(api_url, headers={"User-Agent": "ReviewLens/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
        pages = data.get("query", {}).get("pages", {})
        for page in pages.values():
            thumb = page.get("thumbnail", {})
            if thumb.get("source"):
                return thumb["source"]
    except Exception as e:
        print(f"  Wikipedia API error for '{title}': {e}")
    return None


def _download_image(url: str, dest_path: str) -> bool:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "ReviewLens/1.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        with open(dest_path, "wb") as f:
            f.write(data)
        return True
    except Exception as e:
        print(f"  Download error: {e}")
        return False


async def run() -> None:
    os.makedirs(PUBLIC_DIR, exist_ok=True)

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Product))
        products = result.scalars().all()

        updated = 0
        for product in products:
            wiki_title = WIKI_TITLES.get(product.name)
            if not wiki_title:
                print(f"[SKIP] No Wikipedia title for: {product.name}")
                continue

            filename = _safe_filename(product.name)
            local_path = os.path.join(PUBLIC_DIR, filename)
            web_path = f"/images/phones/{filename}"

            # Skip download if already done
            if os.path.exists(local_path):
                print(f"[CACHED] {product.name}")
            else:
                print(f"[FETCH] {product.name} → Wikipedia: '{wiki_title}'")
                img_url = _fetch_wiki_image_url(wiki_title)
                if not img_url:
                    print(f"  No image found on Wikipedia, skipping.")
                    continue
                print(f"  Downloading: {img_url}")
                if not _download_image(img_url, local_path):
                    continue
                print(f"  Saved to: {local_path}")

            product.image_url = web_path
            updated += 1

        await db.commit()

    print(f"\nDone — updated image_url for {updated} products.")
    print(f"Images saved in: {PUBLIC_DIR}")


if __name__ == "__main__":
    asyncio.run(run())
