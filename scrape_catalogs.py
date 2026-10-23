#!/usr/bin/env python3
"""Fetch small daily samples from public VTEX supermarket catalogs.

Only public product-search routes are requested. The script does not sign in,
place orders, bypass bot controls, or access checkout/account routes. Retailer
catalog prices are online prices, not a guarantee of in-store branch pricing.
"""

from __future__ import annotations

import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin
from urllib.robotparser import RobotFileParser

import requests


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "data" / "latest.json"
USER_AGENT = "OfertasDeSupermercados/0.1 (daily public catalog snapshot)"
PAGE_SIZE = 50

STORES = [
    {"name": "Plaza Vea", "market": "PE", "base": "https://www.plazavea.com.pe", "currency": "PEN"},
    {"name": "Metro", "market": "PE", "base": "https://www.metro.pe", "currency": "PEN"},
    {"name": "Wong", "market": "PE", "base": "https://www.wong.pe", "currency": "PEN"},
    {"name": "Carrefour", "market": "AR", "base": "https://www.carrefour.com.ar", "currency": "ARS"},
    {"name": "Día", "market": "AR", "base": "https://diaonline.supermercadosdia.com.ar", "currency": "ARS"},
    {"name": "Jumbo", "market": "AR", "base": "https://www.jumbo.com.ar", "currency": "ARS"},
]

# These chains are intentionally not scraped until their public catalog route
# is independently available. Tottus returned HTTP 503 from this environment;
# Coto's current public sitemap points to a 2025 snapshot. No block is bypassed.
NOT_CONNECTED = [
    {"name": "Tottus", "market": "PE", "reason": "Catálogo devolvió HTTP 503; pendiente de fuente pública accesible."},
    {"name": "Coto", "market": "AR", "reason": "El sitemap consultable tiene fecha 2025; no sirve como oferta vigente."},
]


def allowed_by_robots(session: requests.Session, base: str, target: str) -> bool:
    response = session.get(urljoin(base, "/robots.txt"), timeout=20)
    response.raise_for_status()
    parser = RobotFileParser()
    parser.set_url(urljoin(base, "/robots.txt"))
    parser.parse(response.text.splitlines())
    return parser.can_fetch(USER_AGENT, target)


def category_of(product: dict) -> str:
    categories = product.get("categories") or []
    if categories:
        return categories[-1].strip("/").split("/")[-1]
    return "Supermercado"


def scrape_store(session: requests.Session, store: dict) -> dict:
    target = urljoin(store["base"], "/api/catalog_system/pub/products/search")
    record = {"name": store["name"], "market": store["market"], "catalogUrl": store["base"], "status": "ok", "count": 0}
    if not allowed_by_robots(session, store["base"], target):
        record.update(status="skipped_robots", error="robots.txt no permite esta ruta")
        return record

    try:
        response = session.get(
            target,
            params={"_from": 0, "_to": PAGE_SIZE - 1},
            headers={"Accept": "application/json"},
            timeout=30,
        )
        if response.status_code not in (200, 206):
            record.update(status="unavailable", error=f"HTTP {response.status_code}")
            return record
        products = response.json()
        if not isinstance(products, list):
            record.update(status="unavailable", error="respuesta no es una lista de productos")
            return record

        offers = []
        for product in products:
            items = product.get("items") or []
            candidates = []
            for item in items:
                for seller in item.get("sellers") or []:
                    commercial = seller.get("commertialOffer") or {}
                    price = commercial.get("Price") or 0
                    # Most catalogs expose the reference price in ListPrice.
                    # Jumbo currently returns that field in an incompatible
                    # unit, so fall back to PriceWithoutDiscount on outliers.
                    list_price = commercial.get("ListPrice") or 0
                    regular_price = commercial.get("PriceWithoutDiscount") or 0
                    if price and list_price / price > 5:
                        list_price = regular_price
                    available = commercial.get("AvailableQuantity") or 0
                    if price > 0 and list_price > price and available > 0:
                        discount = round((list_price - price) * 100 / list_price, 1)
                        # Reject obvious unit/currency glitches; retain the source price for review.
                        if 0 < discount <= 85:
                            candidates.append((discount, item, seller, commercial, price, list_price, available))
            if not candidates:
                continue
            discount, item, seller, commercial, price, list_price, available = max(candidates, key=lambda row: row[0])
            images = item.get("images") or []
            link = product.get("link") or urljoin(store["base"], f"/{product.get('linkText', '')}/p")
            offers.append({
                "market": store["market"],
                "store": store["name"],
                "storeScope": "online_catalog",
                "name": product.get("productName") or "Producto",
                "brand": product.get("brand") or "",
                "price": round(float(price), 2),
                "oldPrice": round(float(list_price), 2),
                "discount": discount,
                "currency": store["currency"],
                "category": category_of(product),
                "unit": item.get("measurementUnit") or "",
                "image": images[0].get("imageUrl") if images else "",
                "url": link,
                "source": store["base"],
                "available": int(available),
                "seller": seller.get("sellerName") or seller.get("sellerId") or store["name"],
            })
        record["count"] = len(offers)
        return {"source": record, "offers": offers}
    except (requests.RequestException, ValueError, TypeError, KeyError) as exc:
        record.update(status="error", error=f"{type(exc).__name__}: {str(exc)[:180]}")
        return {"source": record, "offers": []}


def main() -> int:
    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT})
    sources = []
    offers = []
    for store in STORES:
        result = scrape_store(session, store)
        if "offers" in result:
            sources.append(result["source"])
            offers.extend(result["offers"])
        else:
            sources.append(result)
        # Keep a light touch on each site's public catalog.
        time.sleep(1.5)

    offers.sort(key=lambda item: (item["discount"], item["available"] > 0), reverse=True)
    captured_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    payload = {
        "capturedAt": captured_at,
        "refreshHours": 24,
        "note": "Precios online observados en catálogos públicos; no garantizan precio/stock en tienda física ni cercanía de sucursal.",
        "sources": sources + [{**item, "status": "not_connected", "count": 0} for item in NOT_CONNECTED],
        "offers": offers,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    temp = OUTPUT.with_suffix(".tmp")
    temp.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    os.replace(temp, OUTPUT)
    connected = sum(1 for item in sources if item.get("status") == "ok")
    print(f"Captured {len(offers)} sale listings from {connected}/{len(STORES)} public catalogs at {captured_at}")
    return 0 if offers else 1


if __name__ == "__main__":
    raise SystemExit(main())
