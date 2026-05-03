"""
Replaces ALL existing data with 50 real flagship & popular phones (2023-2026).
Reviews start at 0 — collect real ones over time.

Run: docker-compose exec api python -m app.seed.seed_real_phones
"""
import asyncio

from sqlalchemy import text

from app.database import AsyncSessionLocal, engine
from app.models.product import Product

# ── Phone catalogue ──────────────────────────────────────────────────────────
#
# Aspect scale  0-5  (0 = not applicable for this device)
#   camera      : overall camera system quality
#   battery     : battery life + charging speed combined
#   performance : chip speed, multitasking, gaming
#   display     : screen quality, refresh rate, brightness
#   audio       : speakers / DAC (0 for most phones unless notable)
#   build       : materials, IP rating, durability
#   value       : price-to-performance ratio
#
# ─────────────────────────────────────────────────────────────────────────────

PHONES = [

    # ── Apple ─────────────────────────────────────────────────────────────────

    {
        "name": "Apple iPhone 17 Pro Max",
        "brand": "Apple", "price": 1199, "icon": "📱",
        "aspects": {"camera": 5.0, "battery": 4.8, "performance": 5.0,
                    "display": 4.9, "audio": 0, "build": 4.9, "value": 4.1},
        "quote": "The most powerful iPhone ever — A19 Pro meets a breakthrough camera system",
        "highlights": ["A19 Pro chip with 6-core GPU", "48MP triple-camera with 5× periscope",
                       "6.9-inch ProMotion Always-On OLED", "Apple Intelligence 2 on-device AI",
                       "Titanium Grade 5 frame, IP68"],
        "pros": ["Best-in-class performance", "Exceptional camera system", "All-day battery life"],
        "cons": ["Premium price point"],
    },
    {
        "name": "Apple iPhone 17 Air",
        "brand": "Apple", "price": 899, "icon": "📱",
        "aspects": {"camera": 4.7, "battery": 4.3, "performance": 4.9,
                    "display": 4.8, "audio": 0, "build": 4.9, "value": 4.3},
        "quote": "At 5.5 mm, the thinnest iPhone ever made — impossibly light, impossibly capable",
        "highlights": ["5.5 mm ultra-thin aluminium body", "A19 chip", "48MP main camera",
                       "Apple Intelligence 2", "6.6-inch ProMotion OLED"],
        "pros": ["Exceptional build & thinness", "Flagship chip performance", "Elegant design"],
        "cons": ["Shorter battery life due to slim profile", "Single rear camera"],
    },
    {
        "name": "Apple iPhone 16 Pro Max",
        "brand": "Apple", "price": 1199, "icon": "📱",
        "aspects": {"camera": 4.9, "battery": 4.7, "performance": 5.0,
                    "display": 4.9, "audio": 0, "build": 4.9, "value": 3.9},
        "quote": "A18 Pro and 4K 120 fps video redefine what a smartphone can do",
        "highlights": ["A18 Pro chip", "48 MP triple-camera — 5× periscope telephoto",
                       "4K 120 fps Dolby Vision recording", "6.9-inch ProMotion Always-On OLED",
                       "Titanium frame, IP68", "USB-C 3 (up to 10 Gb/s)"],
        "pros": ["Exceptional performance", "Exceptional camera system", "Exceptional build quality"],
        "cons": ["Very expensive"],
    },
    {
        "name": "Apple iPhone 16 Pro",
        "brand": "Apple", "price": 999, "icon": "📱",
        "aspects": {"camera": 4.9, "battery": 4.5, "performance": 5.0,
                    "display": 4.9, "audio": 0, "build": 4.9, "value": 4.0},
        "quote": "Pro power in a perfectly sized titanium body",
        "highlights": ["A18 Pro chip", "48 MP triple-camera — 5× periscope telephoto",
                       "6.3-inch ProMotion Always-On OLED", "Camera Control button",
                       "Titanium frame, IP68"],
        "pros": ["Exceptional performance", "Exceptional camera system", "Exceptional build quality"],
        "cons": ["Premium price point"],
    },
    {
        "name": "Apple iPhone 16 Plus",
        "brand": "Apple", "price": 899, "icon": "📱",
        "aspects": {"camera": 4.7, "battery": 4.8, "performance": 4.9,
                    "display": 4.8, "audio": 0, "build": 4.7, "value": 4.2},
        "quote": "The biggest battery in a standard iPhone — all day and then some",
        "highlights": ["A18 chip", "48 MP dual-camera system", "Best-in-class battery life",
                       "6.7-inch Super Retina XDR OLED", "Dynamic Island", "Camera Control button"],
        "pros": ["Exceptional battery life", "Exceptional performance"],
        "cons": ["No telephoto lens", "Premium price point"],
    },
    {
        "name": "Apple iPhone 16",
        "brand": "Apple", "price": 799, "icon": "📱",
        "aspects": {"camera": 4.7, "battery": 4.5, "performance": 4.9,
                    "display": 4.6, "audio": 0, "build": 4.6, "value": 4.4},
        "quote": "Apple Intelligence, Camera Control, and A18 — now for everyone",
        "highlights": ["A18 chip", "48 MP main + 12 MP ultrawide", "Camera Control button",
                       "Apple Intelligence", "Dynamic Island", "USB-C"],
        "pros": ["Excellent performance for price", "Great camera for the tier"],
        "cons": ["60 Hz display (no ProMotion)", "No telephoto lens"],
    },
    {
        "name": "Apple iPhone 15 Pro Max",
        "brand": "Apple", "price": 1199, "icon": "📱",
        "aspects": {"camera": 4.8, "battery": 4.6, "performance": 4.9,
                    "display": 4.8, "audio": 0, "build": 4.8, "value": 4.0},
        "quote": "First iPhone with a 5× periscope telephoto — titanium meets pro photography",
        "highlights": ["A17 Pro chip", "48 MP triple-camera — first 5× periscope telephoto",
                       "6.7-inch ProMotion OLED", "Titanium frame (first time)", "USB-C with USB 3"],
        "pros": ["Exceptional camera system", "Exceptional build quality"],
        "cons": ["Premium price point", "Slow USB-C on base Pro model"],
    },
    {
        "name": "Apple iPhone 15 Pro",
        "brand": "Apple", "price": 999, "icon": "📱",
        "aspects": {"camera": 4.7, "battery": 4.4, "performance": 4.9,
                    "display": 4.8, "audio": 0, "build": 4.8, "value": 4.1},
        "quote": "Titanium. A17 Pro. Action Button. The pro iPhone, refined.",
        "highlights": ["A17 Pro chip", "48 MP triple-camera — 3× telephoto",
                       "6.1-inch ProMotion OLED", "Titanium frame", "Customisable Action Button"],
        "pros": ["Exceptional build quality", "Excellent performance"],
        "cons": ["3× (not 5×) telephoto vs Pro Max", "Moderate battery life"],
    },
    {
        "name": "Apple iPhone 15",
        "brand": "Apple", "price": 799, "icon": "📱",
        "aspects": {"camera": 4.6, "battery": 4.4, "performance": 4.7,
                    "display": 4.6, "audio": 0, "build": 4.6, "value": 4.4},
        "quote": "Dynamic Island and 48 MP come to the mainstream — plus USB-C",
        "highlights": ["A16 Bionic chip", "48 MP main + 12 MP ultrawide",
                       "Dynamic Island", "USB-C (first time on standard model)", "6.1-inch OLED"],
        "pros": ["Dynamic Island at lower price", "Solid camera upgrade"],
        "cons": ["60 Hz display", "No telephoto"],
    },
    {
        "name": "Apple iPhone SE (4th Gen)",
        "brand": "Apple", "price": 429, "icon": "📱",
        "aspects": {"camera": 4.5, "battery": 4.1, "performance": 4.7,
                    "display": 4.3, "audio": 0, "build": 4.4, "value": 4.8},
        "quote": "The most affordable way into iPhone — flagship chip, essential price",
        "highlights": ["A16 Bionic chip", "48 MP single main camera", "6.1-inch OLED",
                       "Face ID", "USB-C", "Apple Intelligence support"],
        "pros": ["Exceptional value for money", "Flagship-class performance at low cost"],
        "cons": ["Single camera — no ultrawide or telephoto", "60 Hz display"],
    },

    # ── Samsung ───────────────────────────────────────────────────────────────

    {
        "name": "Samsung Galaxy S26 Ultra",
        "brand": "Samsung", "price": 1299, "icon": "📱",
        "aspects": {"camera": 5.0, "battery": 4.7, "performance": 5.0,
                    "display": 4.9, "audio": 0, "build": 4.8, "value": 4.0},
        "quote": "Galaxy AI 2.0 and 200 MP redefine what a camera phone can be",
        "highlights": ["Snapdragon 8 Elite Gen 2", "200 MP quad-camera system",
                       "6.9-inch Dynamic AMOLED 2X — 2600 nits peak", "S Pen included",
                       "Titanium frame, IP68", "Galaxy AI 2.0 on-device"],
        "pros": ["Exceptional camera system", "Exceptional performance", "Exceptional display"],
        "cons": ["Premium price point"],
    },
    {
        "name": "Samsung Galaxy S26+",
        "brand": "Samsung", "price": 999, "icon": "📱",
        "aspects": {"camera": 4.7, "battery": 4.6, "performance": 5.0,
                    "display": 4.8, "audio": 0, "build": 4.7, "value": 4.3},
        "quote": "The big-screen flagship that doesn't compromise",
        "highlights": ["Snapdragon 8 Elite Gen 2", "50 MP triple-camera",
                       "6.7-inch Dynamic AMOLED 2X", "45 W fast charging + 15 W wireless",
                       "Galaxy AI 2.0", "IP68"],
        "pros": ["Exceptional performance", "Exceptional battery life"],
        "cons": ["No S Pen"],
    },
    {
        "name": "Samsung Galaxy S26",
        "brand": "Samsung", "price": 799, "icon": "📱",
        "aspects": {"camera": 4.6, "battery": 4.5, "performance": 5.0,
                    "display": 4.7, "audio": 0, "build": 4.6, "value": 4.5},
        "quote": "Snapdragon 8 Elite Gen 2 power at a flagship-accessible price",
        "highlights": ["Snapdragon 8 Elite Gen 2", "50 MP triple-camera",
                       "6.2-inch Dynamic AMOLED 2X 120 Hz", "Galaxy AI 2.0", "IP68"],
        "pros": ["Best-in-class chipset for the price", "Compact flagship design"],
        "cons": ["Smaller battery vs S26+"],
    },
    {
        "name": "Samsung Galaxy Z Fold 7",
        "brand": "Samsung", "price": 1899, "icon": "📱",
        "aspects": {"camera": 4.7, "battery": 4.5, "performance": 5.0,
                    "display": 4.9, "audio": 0, "build": 4.8, "value": 3.8},
        "quote": "The slimmest foldable ever — Galaxy AI folds with you",
        "highlights": ["Snapdragon 8 Elite Gen 2", "5.1 mm slim when folded",
                       "8-inch inner Dynamic AMOLED 2X", "6.5-inch cover display",
                       "S Pen support", "IPX8"],
        "pros": ["Exceptional performance", "Exceptional display experience"],
        "cons": ["Very premium price", "Compromise battery life for thinness"],
    },
    {
        "name": "Samsung Galaxy Z Flip 7",
        "brand": "Samsung", "price": 999, "icon": "📱",
        "aspects": {"camera": 4.5, "battery": 4.4, "performance": 4.9,
                    "display": 4.7, "audio": 0, "build": 4.7, "value": 4.1},
        "quote": "A 4-inch FlexWindow cover display that does almost everything your phone does",
        "highlights": ["Snapdragon 8 Elite Gen 2", "4-inch FlexWindow cover display",
                       "6.7-inch inner foldable AMOLED", "50 MP main camera",
                       "Compact pocketable form factor"],
        "pros": ["Excellent performance", "Best cover display in any flip phone"],
        "cons": ["Average battery for the price", "No telephoto lens"],
    },
    {
        "name": "Samsung Galaxy S25 Ultra",
        "brand": "Samsung", "price": 1299, "icon": "📱",
        "aspects": {"camera": 4.9, "battery": 4.6, "performance": 4.9,
                    "display": 4.9, "audio": 0, "build": 4.8, "value": 4.0},
        "quote": "The AI-powered Galaxy — 200 MP, S Pen, and Snapdragon 8 Elite",
        "highlights": ["Snapdragon 8 Elite", "200 MP quad-camera — 5× periscope",
                       "6.9-inch Dynamic AMOLED 2X — 2600 nits peak brightness",
                       "S Pen included", "Titanium frame, IP68", "Galaxy AI on-device"],
        "pros": ["Exceptional camera system", "Exceptional display", "Exceptional build quality"],
        "cons": ["Premium price point"],
    },
    {
        "name": "Samsung Galaxy S25+",
        "brand": "Samsung", "price": 999, "icon": "📱",
        "aspects": {"camera": 4.7, "battery": 4.6, "performance": 4.9,
                    "display": 4.8, "audio": 0, "build": 4.7, "value": 4.3},
        "quote": "Big battery, big display, big performance — Snapdragon 8 Elite",
        "highlights": ["Snapdragon 8 Elite", "50 MP triple-camera",
                       "6.7-inch Dynamic AMOLED 2X", "4900 mAh battery, 45 W charging",
                       "Galaxy AI", "IP68"],
        "pros": ["Exceptional performance", "Exceptional battery life"],
        "cons": ["No S Pen"],
    },
    {
        "name": "Samsung Galaxy S25",
        "brand": "Samsung", "price": 799, "icon": "📱",
        "aspects": {"camera": 4.6, "battery": 4.5, "performance": 4.9,
                    "display": 4.7, "audio": 0, "build": 4.6, "value": 4.5},
        "quote": "Compact flagship power with Snapdragon 8 Elite inside",
        "highlights": ["Snapdragon 8 Elite", "50 MP triple-camera", "6.2-inch Dynamic AMOLED 120 Hz",
                       "Galaxy AI", "IP68", "Thinner and lighter than S24"],
        "pros": ["Exceptional performance", "Compact design"],
        "cons": ["Smaller 4000 mAh battery", "25 W charging only"],
    },
    {
        "name": "Samsung Galaxy S24 Ultra",
        "brand": "Samsung", "price": 1299, "icon": "📱",
        "aspects": {"camera": 4.9, "battery": 4.6, "performance": 4.8,
                    "display": 4.9, "audio": 0, "build": 4.7, "value": 4.0},
        "quote": "Galaxy AI meets 200 MP — the most capable Galaxy Ultra yet",
        "highlights": ["Snapdragon 8 Gen 3 for Galaxy", "200 MP quad-camera — 5× periscope",
                       "6.8-inch Dynamic AMOLED 2X 120 Hz", "S Pen included",
                       "Titanium frame, IP68", "Galaxy AI (first generation)"],
        "pros": ["Exceptional camera system", "Exceptional display"],
        "cons": ["Premium price point"],
    },
    {
        "name": "Samsung Galaxy S24+",
        "brand": "Samsung", "price": 999, "icon": "📱",
        "aspects": {"camera": 4.7, "battery": 4.5, "performance": 4.8,
                    "display": 4.8, "audio": 0, "build": 4.6, "value": 4.3},
        "quote": "The large-screen Galaxy that hits the performance sweet spot",
        "highlights": ["Snapdragon 8 Gen 3", "50 MP triple-camera", "6.7-inch Dynamic AMOLED 2X",
                       "4900 mAh, 45 W charging", "IP58"],
        "pros": ["Excellent performance", "Great display"],
        "cons": ["No S Pen", "Plastic back (not glass)"],
    },
    {
        "name": "Samsung Galaxy S24",
        "brand": "Samsung", "price": 799, "icon": "📱",
        "aspects": {"camera": 4.6, "battery": 4.4, "performance": 4.7,
                    "display": 4.7, "audio": 0, "build": 4.5, "value": 4.5},
        "quote": "Galaxy AI at its most accessible — compact, capable, connected",
        "highlights": ["Snapdragon 8 Gen 3 (US) / Exynos 2400 (international)",
                       "50 MP triple-camera", "6.2-inch Dynamic AMOLED 2X 120 Hz",
                       "Galaxy AI", "IP58"],
        "pros": ["Great value flagship performance", "Compact size"],
        "cons": ["Plastic back", "4000 mAh battery smaller than competition"],
    },
    {
        "name": "Samsung Galaxy Z Fold 6",
        "brand": "Samsung", "price": 1799, "icon": "📱",
        "aspects": {"camera": 4.6, "battery": 4.4, "performance": 4.8,
                    "display": 4.8, "audio": 0, "build": 4.7, "value": 3.8},
        "quote": "The flagship foldable refined — thinner, lighter, more capable",
        "highlights": ["Snapdragon 8 Gen 3", "7.6-inch inner AMOLED 120 Hz",
                       "6.3-inch cover display", "50 MP triple-camera",
                       "Titanium frame, IP48", "Galaxy AI"],
        "pros": ["Excellent performance", "Large immersive inner display"],
        "cons": ["Very expensive", "Moderate battery life"],
    },
    {
        "name": "Samsung Galaxy Z Flip 6",
        "brand": "Samsung", "price": 999, "icon": "📱",
        "aspects": {"camera": 4.4, "battery": 4.3, "performance": 4.8,
                    "display": 4.7, "audio": 0, "build": 4.6, "value": 4.0},
        "quote": "Snapdragon 8 Gen 3 and a bigger 3.4-inch FlexWindow — the best Flip yet",
        "highlights": ["Snapdragon 8 Gen 3", "3.4-inch FlexWindow cover display",
                       "6.7-inch inner AMOLED 120 Hz", "50 MP main + 12 MP ultrawide",
                       "Galaxy AI", "4000 mAh with 25 W charging"],
        "pros": ["Excellent chip performance", "Stylish compact foldable"],
        "cons": ["Short battery life", "No telephoto lens"],
    },
    {
        "name": "Samsung Galaxy A55 5G",
        "brand": "Samsung", "price": 449, "icon": "📱",
        "aspects": {"camera": 4.4, "battery": 4.6, "performance": 4.4,
                    "display": 4.5, "audio": 0, "build": 4.5, "value": 4.7},
        "quote": "Premium Galaxy design and IP67 durability at a mid-range price",
        "highlights": ["Exynos 1480 processor", "50 MP triple-camera — OIS",
                       "6.6-inch Super AMOLED 120 Hz", "5000 mAh battery",
                       "IP67 water resistance", "Gorilla Glass Victus+"],
        "pros": ["Exceptional value for money", "Great battery life", "IP67 durability"],
        "cons": ["Mid-range chip — not flagship performance"],
    },

    # ── Google ────────────────────────────────────────────────────────────────

    {
        "name": "Google Pixel 10 Pro",
        "brand": "Google", "price": 1099, "icon": "📱",
        "aspects": {"camera": 4.9, "battery": 4.6, "performance": 4.8,
                    "display": 4.8, "audio": 0, "build": 4.6, "value": 4.4},
        "quote": "Tensor G5 and on-device Gemini take AI photography to new heights",
        "highlights": ["Google Tensor G5 chip", "On-device Gemini AI",
                       "50 MP + 48 MP ultrawide + 48 MP 5× periscope telephoto",
                       "6.8-inch LTPO OLED 1–120 Hz", "7 years of OS + security updates"],
        "pros": ["Exceptional camera system", "Best-in-class AI features"],
        "cons": ["Tensor G5 trails Snapdragon in raw CPU benchmarks"],
    },
    {
        "name": "Google Pixel 10",
        "brand": "Google", "price": 799, "icon": "📱",
        "aspects": {"camera": 4.8, "battery": 4.5, "performance": 4.7,
                    "display": 4.7, "audio": 0, "build": 4.5, "value": 4.7},
        "quote": "The best stock Android experience with Gemini built in",
        "highlights": ["Google Tensor G5 chip", "On-device Gemini AI",
                       "50 MP main + 10.5 MP ultrawide", "6.3-inch OLED 120 Hz",
                       "7 years of OS + security updates"],
        "pros": ["Exceptional camera AI at mid-price", "Exceptional value for money"],
        "cons": ["No telephoto lens"],
    },
    {
        "name": "Google Pixel 9 Pro XL",
        "brand": "Google", "price": 1099, "icon": "📱",
        "aspects": {"camera": 4.9, "battery": 4.6, "performance": 4.7,
                    "display": 4.8, "audio": 0, "build": 4.6, "value": 4.4},
        "quote": "The largest, most powerful Pixel — pro photography in an XL body",
        "highlights": ["Google Tensor G4 chip", "50 MP + 48 MP ultrawide + 48 MP 5× periscope",
                       "6.8-inch LTPO OLED 1–120 Hz", "Gemini AI on-device",
                       "7 years of OS + security updates", "IP68"],
        "pros": ["Exceptional camera system", "Best-in-class AI photography"],
        "cons": ["Tensor G4 not top-tier in raw performance"],
    },
    {
        "name": "Google Pixel 9 Pro",
        "brand": "Google", "price": 999, "icon": "📱",
        "aspects": {"camera": 4.9, "battery": 4.5, "performance": 4.7,
                    "display": 4.8, "audio": 0, "build": 4.6, "value": 4.5},
        "quote": "Pro-grade Pixel photography in a compact, premium body",
        "highlights": ["Google Tensor G4", "50 MP + 48 MP ultrawide + 48 MP 5× periscope",
                       "6.3-inch LTPO OLED 1–120 Hz", "Gemini AI", "IP68"],
        "pros": ["Exceptional camera system", "Compact premium build"],
        "cons": ["Tensor G4 not top-tier in raw performance"],
    },
    {
        "name": "Google Pixel 9",
        "brand": "Google", "price": 799, "icon": "📱",
        "aspects": {"camera": 4.7, "battery": 4.5, "performance": 4.7,
                    "display": 4.7, "audio": 0, "build": 4.5, "value": 4.7},
        "quote": "All the Pixel AI magic — clean Android, great camera, honest price",
        "highlights": ["Google Tensor G4", "50 MP main + 10.5 MP ultrawide",
                       "6.3-inch Actua OLED 120 Hz", "Gemini AI", "7 years updates"],
        "pros": ["Great camera for the price", "Exceptional value for money"],
        "cons": ["No telephoto lens"],
    },
    {
        "name": "Google Pixel 9a",
        "brand": "Google", "price": 499, "icon": "📱",
        "aspects": {"camera": 4.7, "battery": 4.8, "performance": 4.6,
                    "display": 4.6, "audio": 0, "build": 4.4, "value": 4.9},
        "quote": "Flagship Pixel cameras and Gemini AI at half the price",
        "highlights": ["Google Tensor G4", "48 MP main + 13 MP ultrawide",
                       "6.3-inch OLED 120 Hz", "Best battery in any Pixel A-series",
                       "Gemini AI", "7 years updates"],
        "pros": ["Exceptional value for money", "Exceptional battery life for price tier"],
        "cons": ["Polycarbonate back", "No periscope telephoto"],
    },
    {
        "name": "Google Pixel 8 Pro",
        "brand": "Google", "price": 999, "icon": "📱",
        "aspects": {"camera": 4.8, "battery": 4.4, "performance": 4.6,
                    "display": 4.7, "audio": 0, "build": 4.5, "value": 4.4},
        "quote": "The first Pixel with a temperature sensor — and AI that actually works",
        "highlights": ["Google Tensor G3", "50 MP + 48 MP ultrawide + 48 MP 5× periscope",
                       "6.7-inch LTPO OLED 1–120 Hz", "7 years OS + security updates",
                       "Built-in thermometer sensor", "Google AI features"],
        "pros": ["Exceptional camera system", "Long software support"],
        "cons": ["Tensor G3 lags in sustained performance"],
    },
    {
        "name": "Google Pixel 8a",
        "brand": "Google", "price": 499, "icon": "📱",
        "aspects": {"camera": 4.6, "battery": 4.5, "performance": 4.5,
                    "display": 4.5, "audio": 0, "build": 4.4, "value": 4.9},
        "quote": "Pixel intelligence at a price everyone can afford",
        "highlights": ["Google Tensor G3", "64 MP main + 13 MP ultrawide",
                       "6.1-inch OLED 120 Hz (first A-series with 120 Hz)",
                       "7 years updates", "IP67"],
        "pros": ["Exceptional value for money", "First A-series with 120 Hz display"],
        "cons": ["No telephoto", "Polycarbonate back"],
    },

    # ── OnePlus ───────────────────────────────────────────────────────────────

    {
        "name": "OnePlus 14",
        "brand": "OnePlus", "price": 899, "icon": "📱",
        "aspects": {"camera": 4.7, "battery": 4.9, "performance": 5.0,
                    "display": 4.8, "audio": 0, "build": 4.7, "value": 4.8},
        "quote": "100 W SUPERVOOC, Snapdragon 8 Elite Gen 2, Hasselblad — flagship-killer perfected",
        "highlights": ["Snapdragon 8 Elite Gen 2", "Hasselblad triple-camera — 50 MP periscope",
                       "6000 mAh battery — 100 W wired, 50 W wireless",
                       "6.82-inch LTPO AMOLED 1–120 Hz", "Full charge in under 30 min"],
        "pros": ["Exceptional performance", "Exceptional battery life", "Exceptional value"],
        "cons": ["OxygenOS add-ons not for everyone"],
    },
    {
        "name": "OnePlus 13",
        "brand": "OnePlus", "price": 899, "icon": "📱",
        "aspects": {"camera": 4.7, "battery": 4.9, "performance": 4.9,
                    "display": 4.8, "audio": 0, "build": 4.7, "value": 4.7},
        "quote": "6000 mAh and 100 W charging make battery anxiety a thing of the past",
        "highlights": ["Snapdragon 8 Elite", "Hasselblad triple-camera — 50 MP 3× periscope",
                       "6000 mAh — 100 W SUPERVOOC + 50 W wireless",
                       "6.82-inch LTPO AMOLED 1–120 Hz", "IP65"],
        "pros": ["Exceptional battery life", "Exceptional performance", "Exceptional value"],
        "cons": ["Wireless charging slower than wired"],
    },
    {
        "name": "OnePlus 13R",
        "brand": "OnePlus", "price": 599, "icon": "📱",
        "aspects": {"camera": 4.4, "battery": 4.8, "performance": 4.7,
                    "display": 4.7, "audio": 0, "build": 4.5, "value": 4.8},
        "quote": "Snapdragon 8 Gen 2 and 80 W charging at a mid-range price",
        "highlights": ["Snapdragon 8 Gen 2", "50 MP main camera",
                       "5500 mAh — 80 W SUPERVOOC charging", "6.78-inch AMOLED 120 Hz",
                       "Alert Slider"],
        "pros": ["Exceptional value for money", "Excellent battery life"],
        "cons": ["No wireless charging", "Camera trails flagship tier"],
    },
    {
        "name": "OnePlus 12",
        "brand": "OnePlus", "price": 799, "icon": "📱",
        "aspects": {"camera": 4.6, "battery": 4.9, "performance": 4.9,
                    "display": 4.8, "audio": 0, "build": 4.6, "value": 4.8},
        "quote": "Snapdragon 8 Gen 3 and 100 W charging — flagship specs, not flagship price",
        "highlights": ["Snapdragon 8 Gen 3", "Hasselblad triple-camera — 64 MP 6× periscope",
                       "5400 mAh — 100 W SUPERVOOC + 50 W AirVOOC wireless",
                       "6.82-inch LTPO AMOLED 1–120 Hz"],
        "pros": ["Exceptional battery life", "Exceptional performance", "Exceptional value"],
        "cons": ["No IP rating in some markets"],
    },

    # ── Xiaomi ────────────────────────────────────────────────────────────────

    {
        "name": "Xiaomi 15 Ultra",
        "brand": "Xiaomi", "price": 1099, "icon": "📱",
        "aspects": {"camera": 5.0, "battery": 4.8, "performance": 4.9,
                    "display": 4.8, "audio": 0, "build": 4.6, "value": 4.4},
        "quote": "A 1-inch Leica Summilux sensor and 200 MP telephoto — this IS a camera",
        "highlights": ["Snapdragon 8 Elite", "1-inch Leica Summilux main sensor (f/1.63)",
                       "200 MP periscope 4.3× + 50 MP ultrawide",
                       "5410 mAh — 90 W HyperCharge wired + 80 W wireless",
                       "6.73-inch LTPO AMOLED 1–120 Hz"],
        "pros": ["Exceptional camera system", "Exceptional battery life"],
        "cons": ["Limited global availability"],
    },
    {
        "name": "Xiaomi 14 Ultra",
        "brand": "Xiaomi", "price": 1099, "icon": "📱",
        "aspects": {"camera": 4.9, "battery": 4.7, "performance": 4.9,
                    "display": 4.8, "audio": 0, "build": 4.6, "value": 4.4},
        "quote": "Leica Summilux optics in a smartphone — photography without compromise",
        "highlights": ["Snapdragon 8 Gen 3", "1-inch Leica Summilux main sensor",
                       "50 MP periscope 5× + 50 MP ultrawide",
                       "5000 mAh — 90 W wired + 80 W wireless",
                       "6.73-inch LTPO AMOLED 1–120 Hz"],
        "pros": ["Exceptional camera system", "Excellent battery life"],
        "cons": ["Limited global availability"],
    },
    {
        "name": "Xiaomi 15",
        "brand": "Xiaomi", "price": 799, "icon": "📱",
        "aspects": {"camera": 4.8, "battery": 4.7, "performance": 4.9,
                    "display": 4.7, "audio": 0, "build": 4.6, "value": 4.6},
        "quote": "Snapdragon 8 Elite and Leica cameras in a compact premium package",
        "highlights": ["Snapdragon 8 Elite", "Leica triple-camera — 50 MP + 50 MP ultrawide + 50 MP 3×",
                       "5240 mAh — 90 W wired + 50 W wireless",
                       "6.36-inch AMOLED 120 Hz"],
        "pros": ["Excellent camera quality", "Excellent performance", "Compact flagship"],
        "cons": ["Smaller display than most flagships"],
    },
    {
        "name": "Xiaomi 14",
        "brand": "Xiaomi", "price": 899, "icon": "📱",
        "aspects": {"camera": 4.8, "battery": 4.6, "performance": 4.9,
                    "display": 4.7, "audio": 0, "build": 4.6, "value": 4.5},
        "quote": "Snapdragon 8 Gen 3 and Leica optics — the compact flagship benchmark",
        "highlights": ["Snapdragon 8 Gen 3", "Leica triple-camera — 50 MP 3.2× telephoto",
                       "4610 mAh — 90 W wired + 50 W wireless",
                       "6.36-inch AMOLED 120 Hz", "IP68"],
        "pros": ["Excellent camera system", "Excellent performance"],
        "cons": ["Average battery capacity (smaller phone size)"],
    },

    # ── Sony ──────────────────────────────────────────────────────────────────

    {
        "name": "Sony Xperia 1 VI",
        "brand": "Sony", "price": 1299, "icon": "📱",
        "aspects": {"camera": 4.8, "battery": 4.5, "performance": 4.8,
                    "display": 4.7, "audio": 4.8, "build": 4.7, "value": 3.9},
        "quote": "A creator's phone: 85–170 mm optical zoom, 3.5 mm jack, and Dolby Atmos",
        "highlights": ["Snapdragon 8 Gen 3", "52 MP (1/1.35-inch) + 12 MP + 85–170 mm optical zoom",
                       "6.5-inch FHD+ AMOLED 1–120 Hz", "Dolby Atmos stereo speakers + 3.5 mm jack",
                       "5000 mAh battery", "IP68 + IP65"],
        "pros": ["Exceptional audio quality", "Professional zoom camera system"],
        "cons": ["Premium niche price", "30 W charging is slow by 2024 standards"],
    },
    {
        "name": "Sony Xperia 5 VI",
        "brand": "Sony", "price": 999, "icon": "📱",
        "aspects": {"camera": 4.7, "battery": 4.6, "performance": 4.8,
                    "display": 4.6, "audio": 4.7, "build": 4.7, "value": 4.1},
        "quote": "All the Xperia 1 VI magic in a compact 6.1-inch body",
        "highlights": ["Snapdragon 8 Gen 3", "Same optical zoom system as Xperia 1 VI",
                       "6.1-inch FHD+ AMOLED 1–120 Hz", "3.5 mm jack + Dolby Atmos",
                       "5000 mAh", "IP68"],
        "pros": ["Excellent audio quality", "Compact premium form factor"],
        "cons": ["Expensive for the size", "30 W charging"],
    },
    {
        "name": "Sony Xperia 10 VI",
        "brand": "Sony", "price": 499, "icon": "📱",
        "aspects": {"camera": 4.2, "battery": 4.8, "performance": 4.2,
                    "display": 4.4, "audio": 4.5, "build": 4.5, "value": 4.4},
        "quote": "The lightest 5G phone with a 3.5 mm jack and exceptional battery life",
        "highlights": ["Snapdragon 6 Gen 1", "48 MP main + 8 MP ultrawide",
                       "6.1-inch FHD+ AMOLED", "5000 mAh — world-class battery life",
                       "3.5 mm headphone jack", "IP68"],
        "pros": ["Exceptional battery life", "Great audio with headphone jack"],
        "cons": ["Mid-range chip performance", "Average camera system"],
    },

    # ── Nothing ───────────────────────────────────────────────────────────────

    {
        "name": "Nothing Phone 3a",
        "brand": "Nothing", "price": 379, "icon": "📱",
        "aspects": {"camera": 4.5, "battery": 4.7, "performance": 4.5,
                    "display": 4.5, "audio": 0, "build": 4.5, "value": 4.9},
        "quote": "Periscope telephoto and Glyph Interface 2.0 — nothing else comes close at this price",
        "highlights": ["Snapdragon 7s Gen 3", "50 MP + 50 MP 3× periscope + 8 MP ultrawide",
                       "5000 mAh — 50 W charging", "6.77-inch AMOLED 120 Hz",
                       "Glyph Interface 2.0", "Nothing OS 3.0"],
        "pros": ["Exceptional value for money", "Best-in-class periscope telephoto under $400"],
        "cons": ["Mid-range chip — no flagship gaming"],
    },
    {
        "name": "Nothing Phone 2a",
        "brand": "Nothing", "price": 349, "icon": "📱",
        "aspects": {"camera": 4.3, "battery": 4.6, "performance": 4.4,
                    "display": 4.5, "audio": 0, "build": 4.5, "value": 4.9},
        "quote": "Glyph Interface meets Dimensity 7200 Pro — standout design, standout value",
        "highlights": ["Dimensity 7200 Pro", "50 MP main + 50 MP ultrawide",
                       "5000 mAh — 45 W charging", "6.7-inch AMOLED 120 Hz",
                       "Glyph Interface", "Nothing OS 2.5"],
        "pros": ["Exceptional value for money", "Unique Glyph Interface design"],
        "cons": ["No telephoto lens", "Mid-range chip"],
    },

    # ── Motorola ──────────────────────────────────────────────────────────────

    {
        "name": "Motorola Edge 50 Ultra",
        "brand": "Motorola", "price": 649, "icon": "📱",
        "aspects": {"camera": 4.5, "battery": 4.6, "performance": 4.6,
                    "display": 4.7, "audio": 0, "build": 4.5, "value": 4.7},
        "quote": "125 W TurboPower and 144 Hz pOLED — more display, more speed, less wait",
        "highlights": ["Snapdragon 8s Gen 3", "50 MP + 64 MP 3× telephoto + 50 MP ultrawide",
                       "4500 mAh — 125 W TurboPower wired + 50 W wireless",
                       "6.67-inch pOLED 144 Hz", "IP68"],
        "pros": ["Great value flagship features", "Ultra-fast 125 W charging"],
        "cons": ["8s Gen 3 below top-tier chips"],
    },
    {
        "name": "Motorola Edge 50 Pro",
        "brand": "Motorola", "price": 549, "icon": "📱",
        "aspects": {"camera": 4.4, "battery": 4.6, "performance": 4.5,
                    "display": 4.6, "audio": 0, "build": 4.4, "value": 4.7},
        "quote": "125 W charging in a mid-range package — never stop for a charge again",
        "highlights": ["Snapdragon 7 Gen 3", "50 MP main + 10 MP 3× telephoto",
                       "4500 mAh — 125 W TurboPower", "6.7-inch LTPO pOLED 1–120 Hz",
                       "IP68"],
        "pros": ["Exceptional value for money", "Ultra-fast 125 W charging"],
        "cons": ["Average camera compared to this tier"],
    },

    # ── Asus ──────────────────────────────────────────────────────────────────

    {
        "name": "Asus ROG Phone 9 Pro",
        "brand": "Asus", "price": 1099, "icon": "📱",
        "aspects": {"camera": 4.4, "battery": 4.8, "performance": 5.0,
                    "display": 4.9, "audio": 4.8, "build": 4.7, "value": 4.1},
        "quote": "185 Hz, Snapdragon 8 Elite, 6000 mAh — engineered for gaming dominance",
        "highlights": ["Snapdragon 8 Elite", "6.78-inch AMOLED 185 Hz (1 ms response)",
                       "6000 mAh — 65 W charging + 15 W wireless",
                       "Best stereo speakers on any smartphone", "AeroActive Cooler 13 compatible",
                       "Shoulder trigger buttons"],
        "pros": ["Exceptional performance", "Exceptional display for gaming",
                 "Exceptional audio quality"],
        "cons": ["Camera not the focus", "Large and heavy form factor"],
    },

    # ── Vivo ──────────────────────────────────────────────────────────────────

    {
        "name": "Vivo X200 Ultra",
        "brand": "Vivo", "price": 1149, "icon": "📱",
        "aspects": {"camera": 5.0, "battery": 4.9, "performance": 4.9,
                    "display": 4.8, "audio": 0, "build": 4.6, "value": 4.3},
        "quote": "1-inch Zeiss sensor, 200 MP periscope, and 200 W charging — unmatched",
        "highlights": ["Dimensity 9400", "1-inch Zeiss APO main sensor",
                       "200 MP periscope 4.3× + 50 MP ultrawide",
                       "6000 mAh — 200 W HiCharge (full in ~15 min) + 100 W wireless",
                       "6.82-inch LTPO AMOLED 1–120 Hz"],
        "pros": ["Exceptional camera system", "Exceptional battery life"],
        "cons": ["Limited global distribution"],
    },

    # ── Oppo ──────────────────────────────────────────────────────────────────

    {
        "name": "Oppo Find X8 Pro",
        "brand": "Oppo", "price": 1099, "icon": "📱",
        "aspects": {"camera": 4.9, "battery": 4.8, "performance": 4.9,
                    "display": 4.8, "audio": 0, "build": 4.7, "value": 4.4},
        "quote": "Hasselblad triple-50 MP system and 80 W charging in an IP69 body",
        "highlights": ["Dimensity 9400", "Hasselblad 50 MP main + 50 MP 6× periscope + 50 MP ultrawide",
                       "5910 mAh — 80 W SuperVOOC + 50 W wireless",
                       "6.78-inch LTPO AMOLED 1–120 Hz", "IP69 (highest IP on any phone)"],
        "pros": ["Exceptional camera system", "Exceptional battery life",
                 "Best IP rating in class"],
        "cons": ["ColorOS may not suit everyone"],
    },
]


# ── Helpers ──────────────────────────────────────────────────────────────────

def _compute_rating(aspects: dict) -> float:
    vals = [v for v in aspects.values() if v > 0]
    return round(sum(vals) / len(vals), 1) if vals else 0.0


# ── Main ─────────────────────────────────────────────────────────────────────

async def seed():
    # Wipe everything and reset PK sequences
    async with engine.begin() as conn:
        await conn.execute(text("TRUNCATE reviews, products RESTART IDENTITY CASCADE"))

    async with AsyncSessionLocal() as session:
        for p in PHONES:
            rating = _compute_rating(p["aspects"])
            product = Product(
                name=p["name"],
                brand=p["brand"],
                category="Phones",
                price=p["price"],
                rating=rating,
                review_count=0,
                icon=p["icon"],
                quote=p["quote"],
                aspects=p["aspects"],
                pros=p.get("pros", []),
                cons=p.get("cons", []),
                highlights=p.get("highlights", []),
            )
            session.add(product)
            print(f"  + {p['name']:45s}  rating={rating}")

        await session.commit()

    print(f"\n✓ Seeded {len(PHONES)} real phones — 0 reviews (collect real ones!)")


if __name__ == "__main__":
    asyncio.run(seed())
