"""
Import phones from a Kaggle CSV into the ReviewLens database.

HOW TO USE
──────────
1. Go to kaggle.com and search for "smartphone specifications dataset" or
   "mobile phone specifications and prices".  Download the CSV file.

2. Copy the CSV into the running Docker container:
       docker cp your_file.csv reviewlens-api-1:/tmp/phones.csv

3. Preview what will be imported (no DB writes):
       docker-compose exec api python -m app.seed.import_kaggle /tmp/phones.csv --preview

4. Import (default: first 50 rows):
       docker-compose exec api python -m app.seed.import_kaggle /tmp/phones.csv

5. Import more rows:
       docker-compose exec api python -m app.seed.import_kaggle /tmp/phones.csv --limit=200

COLUMN MAPPING
──────────────
The script auto-detects common column names.  If detection fails, add your
CSV's actual column name to the relevant list in COLUMN_MAP below.
"""

import asyncio
import csv
import math
import sys
from typing import Optional

from app.database import AsyncSessionLocal
from app.models.product import Product

# ─── Adjust if your CSV uses different column names ───────────────────────────
COLUMN_MAP: dict[str, list[str]] = {
    "name":        ["model", "name", "phone_name", "device_name", "device", "product"],
    "brand":       ["brand", "manufacturer", "company", "oem", "make"],
    "price_inr":   ["price_inr", "price_india", "price(india)", "price (inr)", "inr_price", "price"],
    "price_usd":   ["price_usd", "price (usd)", "usd_price", "price_dollar", "launch_price"],
    "camera_mp":   ["camera_mp", "main_camera_mp", "main_camera", "rear_camera_mp",
                    "rear_camera", "primary_camera", "back_camera", "camera"],
    "battery_mah": ["battery_mah", "battery_capacity_mah", "battery_capacity",
                    "battery", "capacity_mah"],
    "ram_gb":      ["ram_gb", "ram", "memory_gb", "ram (gb)", "ram_size"],
    "refresh_hz":  ["refresh_rate", "refresh_hz", "screen_refresh_rate", "hz",
                    "display_refresh_rate"],
    "storage_gb":  ["storage_gb", "internal_storage_gb", "storage", "internal_storage",
                    "rom", "built_in_storage"],
    "os":          ["os", "operating_system", "platform", "android_version", "software"],
}

USD_TO_INR = 85  # approximate conversion rate


# ─── Spec → score normalisation ───────────────────────────────────────────────

def _clamp(v: float, lo: float = 1.0, hi: float = 5.0) -> float:
    return max(lo, min(hi, v))


def _scale(raw: float, raw_lo: float, raw_hi: float,
           score_lo: float = 3.0, score_hi: float = 5.0) -> float:
    if raw_hi == raw_lo:
        return (score_lo + score_hi) / 2
    return _clamp(score_lo + (raw - raw_lo) / (raw_hi - raw_lo) * (score_hi - score_lo))


def _camera_score(mp: Optional[float]) -> float:
    if mp is None:
        return 4.0
    return round(_scale(mp, 8, 200, 2.8, 4.9), 1)


def _battery_score(mah: Optional[float]) -> float:
    if mah is None:
        return 4.0
    return round(_scale(mah, 2500, 7000, 2.5, 5.0), 1)


def _performance_score(ram: Optional[float]) -> float:
    if ram is None:
        return 4.0
    return round(_scale(ram, 2, 16, 2.5, 5.0), 1)


def _display_score(hz: Optional[float]) -> float:
    if hz is None:
        return 4.0
    if hz >= 144:
        return 4.9
    if hz >= 120:
        return 4.5
    if hz >= 90:
        return 4.0
    return 3.5


def _build_score(price_inr: int) -> float:
    # Pricier phones tend to use premium materials.
    if price_inr >= 100_000:
        return 4.8
    if price_inr >= 60_000:
        return 4.5
    if price_inr >= 30_000:
        return 4.2
    if price_inr >= 15_000:
        return 4.0
    return 3.5


def _value_score(price_inr: int, avg_spec_score: float) -> float:
    # Higher spec per rupee (log-scaled) → better value.
    vpm = avg_spec_score / math.log10(max(price_inr, 1000) + 1)
    return round(_clamp(_scale(vpm, 0.9, 1.4, 2.5, 5.0)), 1)


# ─── Prose generation ─────────────────────────────────────────────────────────

_ASPECT_NOUN = {
    "camera":      "camera system",
    "battery":     "battery life",
    "performance": "performance",
    "display":     "display quality",
    "audio":       "audio quality",
    "build":       "build quality",
    "value":       "value for money",
}


def _make_pros_cons(aspects: dict[str, float]) -> tuple[list[str], list[str]]:
    ranked = sorted(aspects.items(), key=lambda x: x[1], reverse=True)
    pros = [f"Excellent {_ASPECT_NOUN[k]}" for k, _ in ranked[:3]]
    cons = [f"Average {_ASPECT_NOUN[k]} vs rivals" for k, _ in ranked[-2:]]
    return pros, cons


def _make_highlights(camera_mp: Optional[float], battery_mah: Optional[float],
                     ram_gb: Optional[float], hz: Optional[float]) -> list[str]:
    items = []
    if camera_mp:
        items.append(f"{int(camera_mp)} MP main camera")
    if battery_mah:
        items.append(f"{int(battery_mah)} mAh battery")
    if ram_gb:
        items.append(f"{int(ram_gb)} GB RAM")
    if hz and hz >= 90:
        items.append(f"{int(hz)} Hz smooth display")
    return (items or ["5G connectivity", "Fast charging", "Premium build"])[:3]


def _make_quote(brand: str, aspects: dict[str, float]) -> str:
    best_key = max(aspects, key=aspects.get)  # type: ignore[arg-type]
    return f"{brand} device built around outstanding {_ASPECT_NOUN[best_key]}."


# ─── CSV helpers ──────────────────────────────────────────────────────────────

def _detect_columns(headers: list[str]) -> dict[str, str]:
    """Return {field: actual_csv_column} for each field we can detect."""
    lower_map = {h.lower().strip(): h for h in headers}
    detected: dict[str, str] = {}
    for field, candidates in COLUMN_MAP.items():
        for c in candidates:
            if c.lower() in lower_map:
                detected[field] = lower_map[c.lower()]
                break
    return detected


def _to_float(raw: Optional[str]) -> Optional[float]:
    if not raw:
        return None
    cleaned = raw.replace(",", "").replace("₹", "").replace("$", "").split()[0].strip()
    try:
        return float(cleaned)
    except ValueError:
        return None


def _parse_row(row: dict, col: dict[str, str]) -> Optional[dict]:
    def get(field: str) -> Optional[str]:
        key = col.get(field)
        return row.get(key, "").strip() if key else None

    name = get("name") or ""
    brand = get("brand") or ""
    if not name or not brand:
        return None

    # Price — prefer INR, fall back to USD
    price_inr: Optional[int] = None
    raw_inr = _to_float(get("price_inr"))
    if raw_inr and raw_inr > 0:
        price_inr = int(raw_inr)
    else:
        raw_usd = _to_float(get("price_usd"))
        if raw_usd and raw_usd > 0:
            price_inr = int(raw_usd * USD_TO_INR)

    if not price_inr or price_inr <= 0:
        return None

    camera_mp  = _to_float(get("camera_mp"))
    battery_mah = _to_float(get("battery_mah"))
    ram_gb     = _to_float(get("ram_gb"))
    hz         = _to_float(get("refresh_hz"))

    # Build aspect scores from raw specs
    camera_s      = _camera_score(camera_mp)
    battery_s     = _battery_score(battery_mah)
    performance_s = _performance_score(ram_gb)
    display_s     = _display_score(hz)
    build_s       = _build_score(price_inr)
    avg_spec      = (camera_s + battery_s + performance_s + display_s) / 4
    value_s       = _value_score(price_inr, avg_spec)

    aspects = {
        "camera":      camera_s,
        "battery":     battery_s,
        "performance": performance_s,
        "display":     display_s,
        "audio":       4.0,
        "build":       build_s,
        "value":       value_s,
    }

    pros, cons = _make_pros_cons(aspects)
    highlights = _make_highlights(camera_mp, battery_mah, ram_gb, hz)
    quote = _make_quote(brand, aspects)

    return {
        "name":       name[:200],
        "brand":      brand[:100],
        "category":   "Phones",
        "price":      price_inr,
        "icon":       "📱",
        "quote":      quote,
        "aspects":    aspects,
        "pros":       pros,
        "cons":       cons,
        "highlights": highlights,
    }


# ─── Main ─────────────────────────────────────────────────────────────────────

async def run(csv_path: str, preview: bool, limit: int) -> None:
    with open(csv_path, newline="", encoding="utf-8-sig") as fh:
        reader = csv.DictReader(fh)
        col = _detect_columns(list(reader.fieldnames or []))

        print("Detected column mapping:")
        for field, actual in col.items():
            print(f"  {field:15} → {actual}")

        missing_required = [k for k in ("name", "brand") if k not in col]
        if missing_required:
            print(f"\nERROR: Cannot find columns for: {missing_required}")
            print(f"Available CSV headers: {reader.fieldnames}")
            print("\nAdd your column names to COLUMN_MAP in this script and re-run.")
            sys.exit(1)

        if "price_inr" not in col and "price_usd" not in col:
            print("\nWARNING: No price column detected — rows without a usable price will be skipped.")

        all_rows = list(reader)

    products, skipped = [], 0
    for row in all_rows[:limit]:
        parsed = _parse_row(row, col)
        if parsed:
            products.append(parsed)
        else:
            skipped += 1

    print(f"\nParsed {len(products)} products, skipped {skipped} rows (missing name/brand/price).")

    if not products:
        print("Nothing to import. Check your CSV and column mapping.")
        return

    if preview:
        print("\n── Preview (first 5) ─────────────────────────────────────────")
        for p in products[:5]:
            print(f"  {p['brand']} {p['name']}  ₹{p['price']:,}")
            print(f"    Aspects : {p['aspects']}")
            print(f"    Pros    : {p['pros']}")
            print(f"    Cons    : {p['cons']}")
            print()
        print("(--preview mode: nothing written to the database)")
        return

    async with AsyncSessionLocal() as db:
        for data in products:
            db.add(Product(
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
            ))
        await db.commit()

    print(f"Done — inserted {len(products)} products into the database.")


def main() -> None:
    args = sys.argv[1:]
    if not args or "--help" in args:
        print(__doc__)
        sys.exit(0)

    csv_path = args[0]
    preview  = "--preview" in args
    limit    = 50
    for a in args:
        if a.startswith("--limit="):
            limit = int(a.split("=", 1)[1])

    asyncio.run(run(csv_path, preview, limit))


if __name__ == "__main__":
    main()
