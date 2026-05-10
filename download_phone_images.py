"""
Downloads real phone images from Wikipedia and stores them in public/images/phones/.
Updates each product's image_url via the admin API.

Run from the project root (NOT inside Docker):
    python download_phone_images.py

Requirements: Python 3.9+, standard library only. Docker must be running.
"""
import json
import os
import re
import time
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))


def _read_env(filepath: str) -> dict[str, str]:
    """Parse a .env file into a dict. Ignores comments and blank lines."""
    result: dict[str, str] = {}
    try:
        with open(filepath) as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, _, val = line.partition("=")
                result[key.strip()] = val.strip().strip('"').strip("'")
    except FileNotFoundError:
        pass
    return result


# Load config from env files — env vars take precedence over file values
_env_local   = _read_env(os.path.join(ROOT, ".env.local"))
_env_backend = _read_env(os.path.join(ROOT, "backend", ".env.example"))

API_BASE   = os.environ.get("VITE_API_URL",    _env_local.get("VITE_API_URL",    "http://localhost:8000"))
ADMIN_KEY  = os.environ.get("ADMIN_API_KEY",   _env_backend.get("ADMIN_API_KEY", "reviewlens-admin"))
PUBLIC_DIR = os.path.join(ROOT, "public", "images", "phones")

# Wikipedia article title for each phone name (must match exactly what's in the DB)
WIKI_TITLES: dict[str, str] = {
    "Samsung Galaxy S25 Ultra":   "Samsung Galaxy S25 Ultra",
    "Samsung Galaxy S25+":        "Samsung Galaxy S25",
    "Samsung Galaxy S25":         "Samsung Galaxy S25",
    "Apple iPhone 16 Pro Max":    "IPhone 16 Pro",
    "Apple iPhone 16 Pro":        "IPhone 16 Pro",
    "Apple iPhone 16":            "IPhone 16",
    "Xiaomi 15 Ultra":            "Xiaomi 15 Ultra",
    "OnePlus 13":                 "OnePlus 13",
    "OnePlus 13R":                "OnePlus 13R",
    "Google Pixel 9 Pro XL":      "Google Pixel 9 Pro",
    "Google Pixel 9":             "Google Pixel 9",
    "Vivo X200 Pro":              "Vivo X200 Pro",
    "iQOO 13":                    "IQOO 13",
    "Realme GT 7 Pro":            "Realme GT 7 Pro",
    "Motorola Edge 50 Pro":       "Motorola Edge 50 Pro",
    "Nothing Phone (3a)":         "Nothing Phone (3a)",
    "Redmi Note 14 Pro+ 5G":      "Redmi Note 14 Pro+",
}


def _request(url: str, method: str = "GET", body: dict | None = None,
             headers: dict | None = None) -> dict | list | None:
    h = {"Content-Type": "application/json", "User-Agent": "ReviewLens/1.0"}
    if headers:
        h.update(headers)
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, headers=h, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        print(f"  HTTP {e.code}: {e.reason}")
    except Exception as e:
        print(f"  Error: {e}")
    return None


def _wiki_image_url(title: str) -> str | None:
    params = urllib.parse.urlencode({
        "action":      "query",
        "titles":      title,
        "prop":        "pageimages",
        "format":      "json",
        "pithumbsize": 600,
        "pilicense":   "any",
        "redirects":   1,
    })
    resp = _request(f"https://en.wikipedia.org/w/api.php?{params}")
    if not resp:
        return None
    for page in resp.get("query", {}).get("pages", {}).values():
        src = page.get("thumbnail", {}).get("source")
        if src:
            return src
    return None


def _download(url: str, dest: str) -> bool:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "ReviewLens/1.0"})
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = resp.read()
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, "wb") as f:
            f.write(data)
        return True
    except Exception as e:
        print(f"  Download failed: {e}")
        return False


def _slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def main() -> None:
    os.makedirs(PUBLIC_DIR, exist_ok=True)

    # Fetch all products from the API
    resp = _request(f"{API_BASE}/api/products?limit=100")
    if not resp:
        print("ERROR: Cannot reach API. Is Docker running? (docker-compose up -d)")
        return

    products = resp.get("products", [])
    print(f"Found {len(products)} products.\n")

    for product in products:
        pid   = product["id"]
        name  = product["name"]
        title = WIKI_TITLES.get(name)

        if not title:
            print(f"[SKIP] No Wikipedia title configured for: {name}")
            continue

        filename  = f"{_slug(name)}.jpg"
        local_path = os.path.join(PUBLIC_DIR, filename)
        web_path   = f"/images/phones/{filename}"

        if os.path.exists(local_path):
            print(f"[CACHED] {name}")
        else:
            print(f"[FETCH]  {name}  ->  Wikipedia: '{title}'")
            time.sleep(1)  # be polite to Wikipedia
            img_url = _wiki_image_url(title)
            if not img_url:
                print(f"  No image found — skipping.")
                continue
            print(f"  URL: {img_url[:80]}...")
            time.sleep(0.5)
            if not _download(img_url, local_path):
                continue
            kb = os.path.getsize(local_path) // 1024
            print(f"  Saved ({kb} KB) -> {local_path}")

        # Update product via admin API
        result = _request(
            f"{API_BASE}/api/admin/products/{pid}",
            method="PUT",
            body={"image_url": web_path},
            headers={"x-admin-key": ADMIN_KEY},
        )
        if result:
            print(f"  DB updated: image_url = {web_path}")
        else:
            print(f"  Failed to update DB for product {pid}")

    print(f"\nDone. Images saved in: {PUBLIC_DIR}")
    print("Restart the Vite dev server if it's already running.")


if __name__ == "__main__":
    main()
