"""
Run: python -m app.seed.seed_data
Inserts 100 products and ~5000 reviews into the database.
"""
import asyncio
import random
from datetime import date, timedelta

from sqlalchemy import text

from app.database import AsyncSessionLocal, engine
from app.models.product import Product
from app.models.review import Review

random.seed(42)

# ── Product templates per category ──────────────────────────────────────────

PRODUCTS = [
    # Phones (18)
    {"name": "Apple iPhone 15 Pro", "brand": "Apple", "category": "Phones", "price": 999, "icon": "📱",
     "aspects": {"camera": 4.9, "battery": 4.5, "performance": 4.9, "display": 4.8, "audio": 0, "build": 4.8, "value": 4.2},
     "quote": "The most capable iPhone ever made"},
    {"name": "Apple iPhone 15", "brand": "Apple", "category": "Phones", "price": 799, "icon": "📱",
     "aspects": {"camera": 4.7, "battery": 4.4, "performance": 4.8, "display": 4.7, "audio": 0, "build": 4.7, "value": 4.4},
     "quote": "Dynamic Island comes to the base model"},
    {"name": "Samsung Galaxy S24 Ultra", "brand": "Samsung", "category": "Phones", "price": 1299, "icon": "📱",
     "aspects": {"camera": 4.9, "battery": 4.6, "performance": 4.8, "display": 4.9, "audio": 0, "build": 4.7, "value": 4.0},
     "quote": "Galaxy AI redefines mobile productivity"},
    {"name": "Samsung Galaxy S24+", "brand": "Samsung", "category": "Phones", "price": 999, "icon": "📱",
     "aspects": {"camera": 4.7, "battery": 4.5, "performance": 4.7, "display": 4.8, "audio": 0, "build": 4.6, "value": 4.3},
     "quote": "Big screen, bigger performance"},
    {"name": "Google Pixel 8 Pro", "brand": "Google", "category": "Phones", "price": 999, "icon": "📱",
     "aspects": {"camera": 4.9, "battery": 4.4, "performance": 4.7, "display": 4.7, "audio": 0, "build": 4.5, "value": 4.5},
     "quote": "The best computational photography on Android"},
    {"name": "Google Pixel 8a", "brand": "Google", "category": "Phones", "price": 499, "icon": "📱",
     "aspects": {"camera": 4.7, "battery": 4.5, "performance": 4.6, "display": 4.5, "audio": 0, "build": 4.4, "value": 4.8},
     "quote": "Flagship AI at a mid-range price"},
    {"name": "OnePlus 12", "brand": "OnePlus", "category": "Phones", "price": 799, "icon": "📱",
     "aspects": {"camera": 4.5, "battery": 4.8, "performance": 4.8, "display": 4.7, "audio": 0, "build": 4.6, "value": 4.7},
     "quote": "Fastest charging in the flagship segment"},
    {"name": "Xiaomi 14 Ultra", "brand": "Xiaomi", "category": "Phones", "price": 1099, "icon": "📱",
     "aspects": {"camera": 4.8, "battery": 4.6, "performance": 4.8, "display": 4.7, "audio": 0, "build": 4.5, "value": 4.4},
     "quote": "Leica optics in your pocket"},
    {"name": "Sony Xperia 1 VI", "brand": "Sony", "category": "Phones", "price": 1299, "icon": "📱",
     "aspects": {"camera": 4.8, "battery": 4.4, "performance": 4.7, "display": 4.9, "audio": 4.8, "build": 4.6, "value": 3.9},
     "quote": "A creator's phone with 4K display"},
    {"name": "Nothing Phone 2a", "brand": "Nothing", "category": "Phones", "price": 349, "icon": "📱",
     "aspects": {"camera": 4.3, "battery": 4.5, "performance": 4.4, "display": 4.4, "audio": 0, "build": 4.5, "value": 4.9},
     "quote": "Standout design at a standout price"},
    {"name": "Motorola Edge 50 Pro", "brand": "Motorola", "category": "Phones", "price": 549, "icon": "📱",
     "aspects": {"camera": 4.4, "battery": 4.5, "performance": 4.5, "display": 4.6, "audio": 0, "build": 4.4, "value": 4.7},
     "quote": "125W charging changes the game"},
    {"name": "Samsung Galaxy A55", "brand": "Samsung", "category": "Phones", "price": 449, "icon": "📱",
     "aspects": {"camera": 4.4, "battery": 4.6, "performance": 4.4, "display": 4.5, "audio": 0, "build": 4.5, "value": 4.7},
     "quote": "Premium look at a mid-range price"},
    {"name": "Apple iPhone SE (4th Gen)", "brand": "Apple", "category": "Phones", "price": 429, "icon": "📱",
     "aspects": {"camera": 4.5, "battery": 4.0, "performance": 4.8, "display": 4.2, "audio": 0, "build": 4.4, "value": 4.5},
     "quote": "The most affordable way into the Apple ecosystem"},
    {"name": "Asus ROG Phone 8 Pro", "brand": "Asus", "category": "Phones", "price": 1099, "icon": "📱",
     "aspects": {"camera": 4.4, "battery": 4.7, "performance": 4.9, "display": 4.8, "audio": 4.7, "build": 4.6, "value": 4.2},
     "quote": "Engineered for mobile gaming dominance"},
    {"name": "Oppo Find X7 Ultra", "brand": "Oppo", "category": "Phones", "price": 1099, "icon": "📱",
     "aspects": {"camera": 4.9, "battery": 4.5, "performance": 4.7, "display": 4.7, "audio": 0, "build": 4.6, "value": 4.3},
     "quote": "Dual periscope zoom redefines mobile photography"},
    {"name": "Vivo X100 Pro", "brand": "Vivo", "category": "Phones", "price": 999, "icon": "📱",
     "aspects": {"camera": 4.8, "battery": 4.6, "performance": 4.7, "display": 4.7, "audio": 0, "build": 4.5, "value": 4.4},
     "quote": "Zeiss optics meet cutting-edge silicon"},
    {"name": "Realme GT 6", "brand": "Realme", "category": "Phones", "price": 549, "icon": "📱",
     "aspects": {"camera": 4.3, "battery": 4.6, "performance": 4.7, "display": 4.6, "audio": 0, "build": 4.4, "value": 4.8},
     "quote": "Snapdragon 8s Gen 3 at an unbeatable price"},
    {"name": "Honor Magic 6 Pro", "brand": "Honor", "category": "Phones", "price": 899, "icon": "📱",
     "aspects": {"camera": 4.7, "battery": 4.5, "performance": 4.7, "display": 4.8, "audio": 0, "build": 4.6, "value": 4.5},
     "quote": "Eye-tracking AI takes selfies to the next level"},

    # Laptops (18)
    {"name": "Apple MacBook Pro 14 M3 Pro", "brand": "Apple", "category": "Laptops", "price": 1999, "icon": "💻",
     "aspects": {"camera": 0, "battery": 4.8, "performance": 4.9, "display": 4.9, "audio": 4.7, "build": 4.9, "value": 4.1},
     "quote": "The most powerful laptop Apple has ever made"},
    {"name": "Apple MacBook Air M3", "brand": "Apple", "category": "Laptops", "price": 1099, "icon": "💻",
     "aspects": {"camera": 0, "battery": 4.9, "performance": 4.7, "display": 4.7, "audio": 4.5, "build": 4.8, "value": 4.5},
     "quote": "Blazing performance in a fanless design"},
    {"name": "Dell XPS 15", "brand": "Dell", "category": "Laptops", "price": 1799, "icon": "💻",
     "aspects": {"camera": 0, "battery": 4.3, "performance": 4.7, "display": 4.8, "audio": 4.4, "build": 4.7, "value": 4.1},
     "quote": "The benchmark for Windows premium laptops"},
    {"name": "Lenovo ThinkPad X1 Carbon Gen 12", "brand": "Lenovo", "category": "Laptops", "price": 1799, "icon": "💻",
     "aspects": {"camera": 0, "battery": 4.7, "performance": 4.7, "display": 4.6, "audio": 4.3, "build": 4.9, "value": 4.2},
     "quote": "Business reliability redefined"},
    {"name": "Microsoft Surface Pro 10", "brand": "Microsoft", "category": "Laptops", "price": 1599, "icon": "💻",
     "aspects": {"camera": 0, "battery": 4.5, "performance": 4.6, "display": 4.7, "audio": 4.4, "build": 4.7, "value": 4.0},
     "quote": "The most versatile 2-in-1 yet"},
    {"name": "ASUS ROG Zephyrus G16", "brand": "Asus", "category": "Laptops", "price": 2499, "icon": "💻",
     "aspects": {"camera": 0, "battery": 4.2, "performance": 4.9, "display": 4.9, "audio": 4.6, "build": 4.7, "value": 4.2},
     "quote": "Thin, light, and devastatingly powerful"},
    {"name": "HP Spectre x360 14", "brand": "HP", "category": "Laptops", "price": 1599, "icon": "💻",
     "aspects": {"camera": 0, "battery": 4.6, "performance": 4.6, "display": 4.7, "audio": 4.4, "build": 4.7, "value": 4.3},
     "quote": "Elegance meets versatility"},
    {"name": "Lenovo Legion 5i Pro", "brand": "Lenovo", "category": "Laptops", "price": 1499, "icon": "💻",
     "aspects": {"camera": 0, "battery": 4.0, "performance": 4.8, "display": 4.7, "audio": 4.4, "build": 4.5, "value": 4.5},
     "quote": "Gaming performance without the premium price tag"},
    {"name": "Razer Blade 16", "brand": "Razer", "category": "Laptops", "price": 3499, "icon": "💻",
     "aspects": {"camera": 0, "battery": 4.1, "performance": 4.9, "display": 4.9, "audio": 4.5, "build": 4.8, "value": 3.8},
     "quote": "The pinnacle of gaming laptop engineering"},
    {"name": "Samsung Galaxy Book4 Pro", "brand": "Samsung", "category": "Laptops", "price": 1499, "icon": "💻",
     "aspects": {"camera": 0, "battery": 4.5, "performance": 4.6, "display": 4.8, "audio": 4.3, "build": 4.6, "value": 4.4},
     "quote": "AMOLED brilliance in an ultrabook"},
    {"name": "Acer Swift X 14", "brand": "Acer", "category": "Laptops", "price": 999, "icon": "💻",
     "aspects": {"camera": 0, "battery": 4.4, "performance": 4.5, "display": 4.5, "audio": 4.1, "build": 4.4, "value": 4.7},
     "quote": "Creator performance at creator-friendly pricing"},
    {"name": "LG Gram 16", "brand": "LG", "category": "Laptops", "price": 1299, "icon": "💻",
     "aspects": {"camera": 0, "battery": 4.9, "performance": 4.5, "display": 4.6, "audio": 4.2, "build": 4.5, "value": 4.5},
     "quote": "World's lightest 16-inch laptop"},
    {"name": "Framework Laptop 16", "brand": "Framework", "category": "Laptops", "price": 1249, "icon": "💻",
     "aspects": {"camera": 0, "battery": 4.2, "performance": 4.6, "display": 4.5, "audio": 4.0, "build": 4.4, "value": 4.6},
     "quote": "The future of repairable, upgradeable laptops"},
    {"name": "MSI Titan GT77 HX", "brand": "MSI", "category": "Laptops", "price": 3999, "icon": "💻",
     "aspects": {"camera": 0, "battery": 3.6, "performance": 4.9, "display": 4.8, "audio": 4.7, "build": 4.6, "value": 3.7},
     "quote": "Desktop replacement for uncompromising gamers"},
    {"name": "Dell Inspiron 15 Plus", "brand": "Dell", "category": "Laptops", "price": 849, "icon": "💻",
     "aspects": {"camera": 0, "battery": 4.4, "performance": 4.4, "display": 4.4, "audio": 4.1, "build": 4.3, "value": 4.7},
     "quote": "All-day productivity at an honest price"},
    {"name": "Huawei MateBook X Pro", "brand": "Huawei", "category": "Laptops", "price": 1499, "icon": "💻",
     "aspects": {"camera": 0, "battery": 4.6, "performance": 4.6, "display": 4.8, "audio": 4.4, "build": 4.8, "value": 4.3},
     "quote": "Ultra-thin elegance with stunning OLED display"},
    {"name": "Gigabyte Aorus 17X", "brand": "Gigabyte", "category": "Laptops", "price": 2799, "icon": "💻",
     "aspects": {"camera": 0, "battery": 3.8, "performance": 4.8, "display": 4.7, "audio": 4.4, "build": 4.5, "value": 4.1},
     "quote": "Extreme performance for extreme gamers"},
    {"name": "Asus ZenBook Pro 14 Duo", "brand": "Asus", "category": "Laptops", "price": 1799, "icon": "💻",
     "aspects": {"camera": 0, "battery": 4.1, "performance": 4.7, "display": 4.8, "audio": 4.5, "build": 4.7, "value": 4.2},
     "quote": "Dual-screen innovation for creators"},

    # Headphones (16)
    {"name": "Sony WH-1000XM5", "brand": "Sony", "category": "Headphones", "price": 349, "icon": "🎧",
     "aspects": {"camera": 0, "battery": 4.7, "performance": 0, "display": 0, "audio": 4.9, "build": 4.6, "value": 4.5},
     "quote": "Industry-leading ANC just got better"},
    {"name": "Apple AirPods Max", "brand": "Apple", "category": "Headphones", "price": 549, "icon": "🎧",
     "aspects": {"camera": 0, "battery": 4.4, "performance": 0, "display": 0, "audio": 4.8, "build": 4.9, "value": 3.8},
     "quote": "High-fidelity audio in a premium design"},
    {"name": "Bose QuietComfort Ultra", "brand": "Bose", "category": "Headphones", "price": 429, "icon": "🎧",
     "aspects": {"camera": 0, "battery": 4.5, "performance": 0, "display": 0, "audio": 4.8, "build": 4.7, "value": 4.2},
     "quote": "Quieter world, richer sound"},
    {"name": "Sennheiser Momentum 4", "brand": "Sennheiser", "category": "Headphones", "price": 349, "icon": "🎧",
     "aspects": {"camera": 0, "battery": 4.9, "performance": 0, "display": 0, "audio": 4.8, "build": 4.6, "value": 4.5},
     "quote": "60-hour battery changes everything"},
    {"name": "Sony WF-1000XM5", "brand": "Sony", "category": "Headphones", "price": 279, "icon": "🎧",
     "aspects": {"camera": 0, "battery": 4.5, "performance": 0, "display": 0, "audio": 4.8, "build": 4.6, "value": 4.4},
     "quote": "World's smallest ANC earbuds"},
    {"name": "Apple AirPods Pro 2", "brand": "Apple", "category": "Headphones", "price": 249, "icon": "🎧",
     "aspects": {"camera": 0, "battery": 4.7, "performance": 0, "display": 0, "audio": 4.7, "build": 4.7, "value": 4.3},
     "quote": "Adaptive Audio adapts to your world"},
    {"name": "Jabra Evolve2 85", "brand": "Jabra", "category": "Headphones", "price": 449, "icon": "🎧",
     "aspects": {"camera": 0, "battery": 4.6, "performance": 0, "display": 0, "audio": 4.6, "build": 4.7, "value": 4.2},
     "quote": "Engineered for the hybrid workplace"},
    {"name": "Anker Soundcore Q45", "brand": "Anker", "category": "Headphones", "price": 79, "icon": "🎧",
     "aspects": {"camera": 0, "battery": 4.8, "performance": 0, "display": 0, "audio": 4.3, "build": 4.2, "value": 4.9},
     "quote": "Premium ANC without the premium price"},
    {"name": "Audio-Technica ATH-M50xBT2", "brand": "Audio-Technica", "category": "Headphones", "price": 199, "icon": "🎧",
     "aspects": {"camera": 0, "battery": 4.5, "performance": 0, "display": 0, "audio": 4.7, "build": 4.6, "value": 4.7},
     "quote": "Studio-grade monitoring goes wireless"},
    {"name": "Beats Studio Pro", "brand": "Beats", "category": "Headphones", "price": 349, "icon": "🎧",
     "aspects": {"camera": 0, "battery": 4.6, "performance": 0, "display": 0, "audio": 4.5, "build": 4.7, "value": 4.2},
     "quote": "Personalized spatial audio with Dolby Atmos"},
    {"name": "Bang & Olufsen Beoplay H100", "brand": "Bang & Olufsen", "category": "Headphones", "price": 999, "icon": "🎧",
     "aspects": {"camera": 0, "battery": 4.4, "performance": 0, "display": 0, "audio": 4.9, "build": 4.9, "value": 3.7},
     "quote": "Luxury audio craftsmanship redefined"},
    {"name": "Samsung Galaxy Buds3 Pro", "brand": "Samsung", "category": "Headphones", "price": 249, "icon": "🎧",
     "aspects": {"camera": 0, "battery": 4.4, "performance": 0, "display": 0, "audio": 4.6, "build": 4.6, "value": 4.4},
     "quote": "Blade design meets Intelligent ANC"},
    {"name": "Nothing Ear (2)", "brand": "Nothing", "category": "Headphones", "price": 149, "icon": "🎧",
     "aspects": {"camera": 0, "battery": 4.5, "performance": 0, "display": 0, "audio": 4.5, "build": 4.5, "value": 4.7},
     "quote": "Transparent design, clear sound"},
    {"name": "Shure Aonic 50 Gen 2", "brand": "Shure", "category": "Headphones", "price": 379, "icon": "🎧",
     "aspects": {"camera": 0, "battery": 4.6, "performance": 0, "display": 0, "audio": 4.8, "build": 4.7, "value": 4.3},
     "quote": "Audiophile sound with professional-grade ANC"},
    {"name": "Marshall Major V", "brand": "Marshall", "category": "Headphones", "price": 149, "icon": "🎧",
     "aspects": {"camera": 0, "battery": 4.9, "performance": 0, "display": 0, "audio": 4.5, "build": 4.5, "value": 4.7},
     "quote": "80 hours of pure rock and roll"},
    {"name": "Google Pixel Buds Pro 2", "brand": "Google", "category": "Headphones", "price": 229, "icon": "🎧",
     "aspects": {"camera": 0, "battery": 4.6, "performance": 0, "display": 0, "audio": 4.6, "build": 4.5, "value": 4.5},
     "quote": "Silence the world with Google Tensor A1"},

    # Smartwatches (16)
    {"name": "Apple Watch Series 10", "brand": "Apple", "category": "Smartwatches", "price": 399, "icon": "⌚",
     "aspects": {"camera": 0, "battery": 4.2, "performance": 4.8, "display": 4.8, "audio": 0, "build": 4.7, "value": 4.3},
     "quote": "The thinnest Apple Watch ever"},
    {"name": "Apple Watch Ultra 2", "brand": "Apple", "category": "Smartwatches", "price": 799, "icon": "⌚",
     "aspects": {"camera": 0, "battery": 4.7, "performance": 4.9, "display": 4.9, "audio": 0, "build": 4.9, "value": 4.0},
     "quote": "Built for exploration, engineered for endurance"},
    {"name": "Samsung Galaxy Watch 7", "brand": "Samsung", "category": "Smartwatches", "price": 299, "icon": "⌚",
     "aspects": {"camera": 0, "battery": 4.3, "performance": 4.7, "display": 4.7, "audio": 0, "build": 4.6, "value": 4.5},
     "quote": "Advanced health insights powered by BioActive sensor"},
    {"name": "Google Pixel Watch 3", "brand": "Google", "category": "Smartwatches", "price": 349, "icon": "⌚",
     "aspects": {"camera": 0, "battery": 4.4, "performance": 4.6, "display": 4.7, "audio": 0, "build": 4.5, "value": 4.4},
     "quote": "The smartest Fitbit health features, wrist-delivered"},
    {"name": "Garmin Fenix 8 Sapphire", "brand": "Garmin", "category": "Smartwatches", "price": 899, "icon": "⌚",
     "aspects": {"camera": 0, "battery": 4.9, "performance": 4.8, "display": 4.6, "audio": 0, "build": 4.9, "value": 4.1},
     "quote": "The ultimate multisport GPS smartwatch"},
    {"name": "Garmin Venu 3", "brand": "Garmin", "category": "Smartwatches", "price": 449, "icon": "⌚",
     "aspects": {"camera": 0, "battery": 4.7, "performance": 4.6, "display": 4.6, "audio": 0, "build": 4.7, "value": 4.4},
     "quote": "Stylish health and wellness tracking"},
    {"name": "Fitbit Charge 6", "brand": "Fitbit", "category": "Smartwatches", "price": 159, "icon": "⌚",
     "aspects": {"camera": 0, "battery": 4.6, "performance": 4.4, "display": 4.3, "audio": 0, "build": 4.4, "value": 4.7},
     "quote": "Google apps + Fitbit tracking in one band"},
    {"name": "Amazfit Balance", "brand": "Amazfit", "category": "Smartwatches", "price": 249, "icon": "⌚",
     "aspects": {"camera": 0, "battery": 4.8, "performance": 4.5, "display": 4.5, "audio": 0, "build": 4.5, "value": 4.8},
     "quote": "Holistic wellness without the premium price"},
    {"name": "Withings ScanWatch 2", "brand": "Withings", "category": "Smartwatches", "price": 349, "icon": "⌚",
     "aspects": {"camera": 0, "battery": 4.9, "performance": 4.4, "display": 4.4, "audio": 0, "build": 4.7, "value": 4.4},
     "quote": "Medical-grade health tracking meets classic design"},
    {"name": "Samsung Galaxy Watch Ultra", "brand": "Samsung", "category": "Smartwatches", "price": 649, "icon": "⌚",
     "aspects": {"camera": 0, "battery": 4.5, "performance": 4.7, "display": 4.8, "audio": 0, "build": 4.8, "value": 4.0},
     "quote": "Ultra durability for extreme adventures"},
    {"name": "Polar Grit X2 Pro", "brand": "Polar", "category": "Smartwatches", "price": 599, "icon": "⌚",
     "aspects": {"camera": 0, "battery": 4.8, "performance": 4.6, "display": 4.5, "audio": 0, "build": 4.8, "value": 4.2},
     "quote": "Sapphire glass meets military-grade durability"},
    {"name": "COROS VERTIX 2S", "brand": "COROS", "category": "Smartwatches", "price": 699, "icon": "⌚",
     "aspects": {"camera": 0, "battery": 4.9, "performance": 4.7, "display": 4.5, "audio": 0, "build": 4.8, "value": 4.3},
     "quote": "60-day battery for the world's toughest routes"},
    {"name": "Suunto Race S", "brand": "Suunto", "category": "Smartwatches", "price": 499, "icon": "⌚",
     "aspects": {"camera": 0, "battery": 4.6, "performance": 4.6, "display": 4.6, "audio": 0, "build": 4.7, "value": 4.4},
     "quote": "AMOLED precision for serious athletes"},
    {"name": "Huawei Watch GT 5 Pro", "brand": "Huawei", "category": "Smartwatches", "price": 399, "icon": "⌚",
     "aspects": {"camera": 0, "battery": 4.8, "performance": 4.6, "display": 4.7, "audio": 0, "build": 4.7, "value": 4.5},
     "quote": "Titanium frame with extraordinary battery life"},
    {"name": "Xiaomi Watch S3", "brand": "Xiaomi", "category": "Smartwatches", "price": 199, "icon": "⌚",
     "aspects": {"camera": 0, "battery": 4.7, "performance": 4.5, "display": 4.5, "audio": 0, "build": 4.5, "value": 4.8},
     "quote": "HyperOS smarts at an everyday price"},
    {"name": "Casio G-SHOCK GBD-H2000", "brand": "Casio", "category": "Smartwatches", "price": 299, "icon": "⌚",
     "aspects": {"camera": 0, "battery": 4.6, "performance": 4.4, "display": 4.3, "audio": 0, "build": 4.9, "value": 4.6},
     "quote": "Toughness that never quits"},

    # Cameras (16)
    {"name": "Sony Alpha A7R V", "brand": "Sony", "category": "Cameras", "price": 3899, "icon": "📷",
     "aspects": {"camera": 4.9, "battery": 4.2, "performance": 4.8, "display": 4.7, "audio": 0, "build": 4.8, "value": 4.0},
     "quote": "61MP with AI-powered autofocus"},
    {"name": "Nikon Z8", "brand": "Nikon", "category": "Cameras", "price": 3999, "icon": "📷",
     "aspects": {"camera": 4.9, "battery": 4.5, "performance": 4.9, "display": 4.7, "audio": 0, "build": 4.9, "value": 4.3},
     "quote": "Z9 performance in a compact body"},
    {"name": "Canon EOS R6 Mark II", "brand": "Canon", "category": "Cameras", "price": 2499, "icon": "📷",
     "aspects": {"camera": 4.8, "battery": 4.3, "performance": 4.9, "display": 4.6, "audio": 0, "build": 4.7, "value": 4.4},
     "quote": "20fps shooting with perfect autofocus"},
    {"name": "Fujifilm X-T5", "brand": "Fujifilm", "category": "Cameras", "price": 1699, "icon": "📷",
     "aspects": {"camera": 4.8, "battery": 4.2, "performance": 4.7, "display": 4.6, "audio": 0, "build": 4.8, "value": 4.5},
     "quote": "40MP film simulation in a compact body"},
    {"name": "Sony ZV-E10 II", "brand": "Sony", "category": "Cameras", "price": 749, "icon": "📷",
     "aspects": {"camera": 4.6, "battery": 4.0, "performance": 4.5, "display": 4.5, "audio": 4.5, "build": 4.3, "value": 4.7},
     "quote": "The perfect vlogging camera for creators"},
    {"name": "Canon PowerShot V10", "brand": "Canon", "category": "Cameras", "price": 429, "icon": "📷",
     "aspects": {"camera": 4.4, "battery": 4.1, "performance": 4.4, "display": 4.4, "audio": 4.4, "build": 4.3, "value": 4.6},
     "quote": "Pocket-sized 4K vlogging"},
    {"name": "GoPro Hero 13 Black", "brand": "GoPro", "category": "Cameras", "price": 399, "icon": "📷",
     "aspects": {"camera": 4.7, "battery": 4.3, "performance": 4.7, "display": 4.4, "audio": 4.5, "build": 4.9, "value": 4.5},
     "quote": "The most versatile action camera ever"},
    {"name": "DJI Osmo Pocket 3", "brand": "DJI", "category": "Cameras", "price": 519, "icon": "📷",
     "aspects": {"camera": 4.7, "battery": 4.3, "performance": 4.7, "display": 4.6, "audio": 4.5, "build": 4.6, "value": 4.6},
     "quote": "1-inch sensor in a pocketable gimbal camera"},
    {"name": "Panasonic Lumix S5 IIX", "brand": "Panasonic", "category": "Cameras", "price": 2499, "icon": "📷",
     "aspects": {"camera": 4.7, "battery": 4.4, "performance": 4.7, "display": 4.6, "audio": 4.6, "build": 4.7, "value": 4.4},
     "quote": "6K hybrid shooting for video professionals"},
    {"name": "Ricoh GR IIIx", "brand": "Ricoh", "category": "Cameras", "price": 999, "icon": "📷",
     "aspects": {"camera": 4.7, "battery": 4.0, "performance": 4.5, "display": 4.4, "audio": 0, "build": 4.5, "value": 4.5},
     "quote": "Street photography perfected"},
    {"name": "Leica Q3", "brand": "Leica", "category": "Cameras", "price": 5995, "icon": "📷",
     "aspects": {"camera": 4.9, "battery": 4.3, "performance": 4.7, "display": 4.8, "audio": 0, "build": 4.9, "value": 3.6},
     "quote": "60MP full-frame with Summilux 28mm"},
    {"name": "OM System OM-5", "brand": "OM System", "category": "Cameras", "price": 999, "icon": "📷",
     "aspects": {"camera": 4.5, "battery": 4.2, "performance": 4.5, "display": 4.4, "audio": 0, "build": 4.9, "value": 4.5},
     "quote": "Weather-sealed adventure camera"},
    {"name": "Nikon Z50 II", "brand": "Nikon", "category": "Cameras", "price": 899, "icon": "📷",
     "aspects": {"camera": 4.6, "battery": 4.3, "performance": 4.6, "display": 4.5, "audio": 4.4, "build": 4.5, "value": 4.6},
     "quote": "Content creator's APS-C workhorse"},
    {"name": "Sigma fp L", "brand": "Sigma", "category": "Cameras", "price": 2499, "icon": "📷",
     "aspects": {"camera": 4.8, "battery": 3.9, "performance": 4.5, "display": 4.5, "audio": 0, "build": 4.7, "value": 4.3},
     "quote": "World's smallest full-frame camera"},
    {"name": "Insta360 X4", "brand": "Insta360", "category": "Cameras", "price": 499, "icon": "📷",
     "aspects": {"camera": 4.6, "battery": 4.2, "performance": 4.6, "display": 4.3, "audio": 4.3, "build": 4.6, "value": 4.6},
     "quote": "8K 360° captures every angle"},
    {"name": "Phase One IQ4 150MP", "brand": "Phase One", "category": "Cameras", "price": 49000, "icon": "📷",
     "aspects": {"camera": 5.0, "battery": 4.1, "performance": 4.8, "display": 4.5, "audio": 0, "build": 4.9, "value": 3.5},
     "quote": "150 megapixels of medium-format perfection"},

    # Tablets (16)
    {"name": "Apple iPad Pro 13 M4", "brand": "Apple", "category": "Tablets", "price": 1299, "icon": "📲",
     "aspects": {"camera": 4.6, "battery": 4.5, "performance": 4.9, "display": 4.9, "audio": 4.7, "build": 4.9, "value": 4.0},
     "quote": "The thinnest Apple product ever"},
    {"name": "Apple iPad Air M2", "brand": "Apple", "category": "Tablets", "price": 599, "icon": "📲",
     "aspects": {"camera": 4.5, "battery": 4.7, "performance": 4.8, "display": 4.7, "audio": 4.5, "build": 4.8, "value": 4.5},
     "quote": "Powerful, colourful, wonderful"},
    {"name": "Samsung Galaxy Tab S10 Ultra", "brand": "Samsung", "category": "Tablets", "price": 1199, "icon": "📲",
     "aspects": {"camera": 4.5, "battery": 4.4, "performance": 4.8, "display": 4.9, "audio": 4.7, "build": 4.7, "value": 4.1},
     "quote": "14.6-inch AMOLED for ultimate productivity"},
    {"name": "Samsung Galaxy Tab S10+", "brand": "Samsung", "category": "Tablets", "price": 999, "icon": "📲",
     "aspects": {"camera": 4.4, "battery": 4.5, "performance": 4.7, "display": 4.8, "audio": 4.6, "build": 4.7, "value": 4.3},
     "quote": "12.4-inch canvas for work and play"},
    {"name": "Microsoft Surface Pro 11", "brand": "Microsoft", "category": "Tablets", "price": 1499, "icon": "📲",
     "aspects": {"camera": 4.4, "battery": 4.6, "performance": 4.8, "display": 4.7, "audio": 4.5, "build": 4.7, "value": 4.1},
     "quote": "Snapdragon X Elite brings Copilot+ to Surface"},
    {"name": "Lenovo Tab P12 Pro", "brand": "Lenovo", "category": "Tablets", "price": 799, "icon": "📲",
     "aspects": {"camera": 4.3, "battery": 4.5, "performance": 4.6, "display": 4.8, "audio": 4.6, "build": 4.5, "value": 4.5},
     "quote": "12.6-inch AMOLED for media enthusiasts"},
    {"name": "Google Pixel Tablet 2", "brand": "Google", "category": "Tablets", "price": 499, "icon": "📲",
     "aspects": {"camera": 4.3, "battery": 4.5, "performance": 4.6, "display": 4.6, "audio": 4.4, "build": 4.5, "value": 4.6},
     "quote": "Hub mode transforms your tablet into a smart display"},
    {"name": "OnePlus Pad 2", "brand": "OnePlus", "category": "Tablets", "price": 549, "icon": "📲",
     "aspects": {"camera": 4.3, "battery": 4.6, "performance": 4.7, "display": 4.7, "audio": 4.5, "build": 4.6, "value": 4.7},
     "quote": "144Hz LTPO display meets Dimensity 9300"},
    {"name": "Xiaomi Pad 6 Pro", "brand": "Xiaomi", "category": "Tablets", "price": 499, "icon": "📲",
     "aspects": {"camera": 4.3, "battery": 4.5, "performance": 4.7, "display": 4.7, "audio": 4.5, "build": 4.5, "value": 4.8},
     "quote": "Flagship Android tablet at half the price"},
    {"name": "Huawei MatePad Pro 13.2", "brand": "Huawei", "category": "Tablets", "price": 799, "icon": "📲",
     "aspects": {"camera": 4.4, "battery": 4.5, "performance": 4.7, "display": 4.8, "audio": 4.6, "build": 4.7, "value": 4.4},
     "quote": "OLED display with satellite connectivity"},
    {"name": "Amazon Fire Max 11", "brand": "Amazon", "category": "Tablets", "price": 229, "icon": "📲",
     "aspects": {"camera": 4.0, "battery": 4.5, "performance": 4.3, "display": 4.4, "audio": 4.3, "build": 4.3, "value": 4.8},
     "quote": "Alexa-powered entertainment at an unbeatable price"},
    {"name": "Oppo Pad 3 Pro", "brand": "Oppo", "category": "Tablets", "price": 649, "icon": "📲",
     "aspects": {"camera": 4.3, "battery": 4.6, "performance": 4.7, "display": 4.8, "audio": 4.5, "build": 4.6, "value": 4.6},
     "quote": "Dimensity 9300 powers every creative task"},
    {"name": "Realme Pad X", "brand": "Realme", "category": "Tablets", "price": 299, "icon": "📲",
     "aspects": {"camera": 4.1, "battery": 4.5, "performance": 4.4, "display": 4.5, "audio": 4.4, "build": 4.4, "value": 4.8},
     "quote": "Affordable performance for everyday creators"},
    {"name": "Sony Xperia Tablet Z", "brand": "Sony", "category": "Tablets", "price": 899, "icon": "📲",
     "aspects": {"camera": 4.4, "battery": 4.3, "performance": 4.6, "display": 4.8, "audio": 4.8, "build": 4.7, "value": 4.3},
     "quote": "Entertainment-first tablet with Sony sound"},
    {"name": "Nokia T21", "brand": "Nokia", "category": "Tablets", "price": 249, "icon": "📲",
     "aspects": {"camera": 4.0, "battery": 4.6, "performance": 4.2, "display": 4.3, "audio": 4.2, "build": 4.4, "value": 4.7},
     "quote": "Pure Android with two-year OS updates"},
    {"name": "Blackview Tab 18", "brand": "Blackview", "category": "Tablets", "price": 299, "icon": "📲",
     "aspects": {"camera": 4.0, "battery": 4.7, "performance": 4.3, "display": 4.4, "audio": 4.3, "build": 4.5, "value": 4.9},
     "quote": "Rugged 12-inch tablet built for the field"},
]

# ── Review templates ─────────────────────────────────────────────────────────

POSITIVE_REVIEWS = [
    ("Amazing product!", "Absolutely love it — exactly what I needed. Would buy again."),
    ("Exceeded my expectations", "This is hands down the best purchase I've made this year."),
    ("Flawless performance", "Zero complaints. The build quality is outstanding."),
    ("Best in class", "I tried several alternatives and nothing comes close to this."),
    ("Worth every penny", "Premium feel from day one. The quality justifies the price."),
    ("Blown away", "I didn't expect it to be this good. Hugely impressed."),
    ("Highly recommended", "I've recommended this to all my friends. Can't go wrong."),
    ("Superb quality", "The attention to detail is remarkable. Feels incredibly premium."),
    ("Perfect daily driver", "It does everything I need and more. Couldn't be happier."),
    ("Game changer", "Honestly changed how I work. So much more productive now."),
]

NEGATIVE_REVIEWS = [
    ("Disappointing", "Expected much more for the price. Several issues out of the box."),
    ("Not worth it", "The marketing doesn't match reality. Very let down."),
    ("Quality issues", "Feels cheaper than it looks in photos. Not impressed."),
    ("Overpriced", "You can get the same for half the price elsewhere."),
    ("Poor battery life", "Battery drains way faster than advertised. Very frustrating."),
    ("Buggy software", "Lots of crashes and slowdowns. Needs major software updates."),
    ("Bad after-sales support", "Customer service was useless when I reported my issue."),
    ("Returned it", "Sent it back after a week. Simply doesn't live up to the hype."),
]

NEUTRAL_REVIEWS = [
    ("It's okay", "Does the job but nothing spectacular. Average for the price."),
    ("Mixed feelings", "Some things I love, some things I don't. Depends on your needs."),
    ("Decent but not great", "Solid product, but there are better options out there."),
    ("For the right person", "Not for everyone, but if you know what you need, this works."),
]

AUTHORS = [
    "Alex M.", "Jamie T.", "Chris P.", "Sam W.", "Jordan K.", "Taylor R.", "Morgan L.",
    "Casey B.", "Riley N.", "Quinn A.", "Drew H.", "Parker S.", "Avery G.", "Sydney F.",
    "Cameron D.", "Reese O.", "Skyler V.", "Hayden C.", "Dakota Y.", "Blake J.",
    "Kai L.", "River M.", "Sage N.", "Rowan K.", "Finley A.", "Elliot B.", "Dylan T.",
    "Peyton R.", "Brooke S.", "Charlie W.", "Emery F.", "Harley G.", "Jesse H.",
    "Kendall I.", "Logan J.", "Mackenzie P.", "Noel Q.", "Oakley R.", "Paige S.",
    "Quinn T.", "Remy U.", "Spencer V.", "Tatum W.", "Uma X.", "Violet Y.",
]


def _random_date() -> str:
    start = date(2023, 1, 1)
    delta = timedelta(days=random.randint(0, 480))
    return (start + delta).strftime("%Y-%m-%d")


def _make_reviews(product_id: int, count: int = 50) -> list[dict]:
    reviews = []
    for _ in range(count):
        roll = random.random()
        if roll < 0.65:
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
            "verified": random.random() < 0.6,
            "helpful": random.randint(0, 120),
            "date": _random_date(),
        })
    return reviews


def _make_pros_cons(aspects: dict) -> tuple[list[str], list[str], list[str]]:
    strong = [k for k, v in aspects.items() if v >= 4.7 and v > 0]
    weak = [k for k, v in aspects.items() if 0 < v < 4.0]

    label_map = {
        "camera": "Camera", "battery": "Battery life", "performance": "Performance",
        "display": "Display", "audio": "Audio quality", "build": "Build quality", "value": "Value for money",
    }
    pros = [f"Exceptional {label_map[k]}" for k in strong[:3]]
    cons = [f"Average {label_map[k]}" for k in weak[:2]]
    highlights = [
        f"Rated highly for {label_map[k]}" for k, v in aspects.items() if v >= 4.5 and v > 0
    ][:4]

    if not pros:
        pros = ["Reliable everyday performance"]
    if not cons:
        cons = ["Premium price point"]
    if not highlights:
        highlights = ["Well-rounded device for its category"]

    return pros, cons, highlights


# ── Main seeder ──────────────────────────────────────────────────────────────

async def seed():
    async with engine.begin() as conn:
        await conn.execute(text("TRUNCATE reviews, products RESTART IDENTITY CASCADE"))

    async with AsyncSessionLocal() as session:
        product_id = 1
        for p in PRODUCTS:
            rating = round(
                sum(v for v in p["aspects"].values() if v > 0) /
                max(1, sum(1 for v in p["aspects"].values() if v > 0)),
                1,
            )
            pros, cons, highlights = _make_pros_cons(p["aspects"])
            review_count = random.randint(420, 18000)

            product = Product(
                id=product_id,
                name=p["name"],
                brand=p["brand"],
                category=p["category"],
                price=p["price"],
                rating=rating,
                review_count=review_count,
                icon=p["icon"],
                quote=p.get("quote", ""),
                aspects=p["aspects"],
                pros=pros,
                cons=cons,
                highlights=highlights,
            )
            session.add(product)

            for rv in _make_reviews(product_id, count=50):
                session.add(Review(**rv))

            product_id += 1

        await session.commit()
        print(f"✓ Seeded {len(PRODUCTS)} products and {len(PRODUCTS) * 50} reviews")


if __name__ == "__main__":
    asyncio.run(seed())
