# 02 — Architecture Guide

## How the App is Structured

ReviewLens uses a **3-column fixed layout** — the same pattern used by apps like Slack, Gmail, and Notion.

```
┌──────────────────────────────────────────────────────────────────┐
│  HEADER  (search bar, write review, notifications, user)         │
├────────────┬─────────────────────────────────┬───────────────────┤
│            │                                 │                   │
│  SIDEBAR   │        MAIN CONTENT             │   RIGHT PANEL     │
│  (240px)   │        (flex-1)                 │   (288px)         │
│            │                                 │                   │
│  Nav items │  HeroSection                    │  Review Summary   │
│  My Act.   │  CategoryPills                  │  What ppl love    │
│  Share crd │  TopReviewedProducts            │  Recently Analyz. │
│            │  ReviewInsights                 │                   │
└────────────┴─────────────────────────────────┴───────────────────┘
```

---

## Component Tree

```
App
├── Sidebar                      ← Left fixed panel (w-60)
│   ├── Logo + tagline
│   ├── NavItem (×8)             ← Home, Top Rated, Categories...
│   ├── ActivityItem (×3)        ← Recently Viewed, Helpful...
│   └── ShareExperienceCard      ← CTA card at the bottom
│
├── Header                       ← Top bar
│   ├── SearchBar
│   ├── WriteReviewButton
│   ├── NotificationBell
│   └── UserAvatar
│
├── Main Content (overflow-y-auto)
│   ├── HeroSection              ← Featured product + rating
│   │   ├── ProductIllustration  ← SVG phone graphic
│   │   ├── OverallRating        ← Big number + stars
│   │   └── AspectBars           ← Camera, Battery, etc.
│   │
│   ├── CategoryPills            ← Horizontal scrollable row
│   │   └── CategoryCard (×5)   ← Each category chip
│   │
│   ├── TopReviewedProducts      ← Main product grid
│   │   ├── TabGroup             ← Overall Best | Best Value | ...
│   │   ├── ProductCard (×4)     ← Each ranked product
│   │   └── FiltersButton
│   │
│   └── ReviewInsights           ← 4 stat boxes
│       └── StatBox (×4)
│
└── ReviewSummaryPanel           ← Right fixed panel (w-72)
    ├── OverallRating
    ├── StarDistributionBars     ← 5★ 72%, 4★ 20%...
    ├── WhatPeopleLove           ← Green checkmark list
    └── RecentlyAnalyzed         ← 3 product thumbnails
```

---

## Data Flow (Sprint 1 — Mock Data)

In Sprint 1, all data is static — imported from `src/data/mockData.ts`.

```
mockData.ts
    │
    ├──→ HeroSection         (heroProduct, overallRating)
    ├──→ CategoryPills       (categories[])
    ├──→ TopReviewedProducts (topProducts[])
    ├──→ ReviewInsights      (insightStats[])
    └──→ ReviewSummaryPanel  (starDistribution[], whatPeopleLove[], recentlyAnalyzed[])
```

In Sprint 3, `mockData.ts` will be replaced with API calls:

```
FastAPI Backend
    │
    └── GET /products/search     → replaces topProducts[]
    └── GET /recommendations     → replaces topProducts[]
    └── GET /categories          → replaces categories[]
    └── GET /products/:id/summary → replaces starDistribution, whatPeopleLove
```

---

## Layout Implementation (CSS)

The 3-column layout uses CSS Flexbox:

```tsx
// App.tsx
<div className="flex h-screen overflow-hidden bg-gray-50">

  {/* Column 1 — Left Sidebar */}
  <Sidebar />   {/* w-60 = 240px, fixed height */}

  {/* Column 2+3 — Everything else */}
  <div className="flex flex-col flex-1 overflow-hidden">

    {/* Top bar */}
    <Header />   {/* h-16, full width */}

    {/* Content area = columns 2 and 3 */}
    <div className="flex flex-1 overflow-hidden">

      {/* Column 2 — Scrollable main content */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <HeroSection />
        <CategoryPills />
        <TopReviewedProducts />
        <ReviewInsights />
      </main>

      {/* Column 3 — Right panel */}
      <ReviewSummaryPanel />   {/* w-72 = 288px */}

    </div>
  </div>
</div>
```

**Why `overflow-hidden` on the outer container?**
It prevents the entire page from scrolling. Instead, only the `<main>` scrolls independently. This keeps the Sidebar and Right Panel always visible.

---

## Design Tokens (Colors)

| Token | Tailwind Class | Hex | Used For |
|-------|---------------|-----|----------|
| Primary | `indigo-600` | `#4F46E5` | Buttons, active nav, badges |
| Active BG | `indigo-50` | `#EEF2FF` | Selected nav item background |
| Stars | `amber-400` | `#FBBF24` | All star ratings |
| Aspect bars | `emerald-500` | `#10B981` | Camera/Battery/etc. bars |
| Distribution | `blue-500` | `#3B82F6` | 5★/4★ bars in right panel |
| Background | `gray-50` | `#F9FAFB` | App background |
| Cards | `white` | `#FFFFFF` | All card components |
| Border | `gray-200` | `#E5E7EB` | Card/section borders |
| Rank #1 | `amber-500` | `#F59E0B` | Gold rank badge |
| Rank #2-3 | `orange-400` | `#FB923C` | Silver/bronze badges |

---

## State Management (Sprint 1)

Sprint 1 has no global state — all data is static. Zustand will be introduced in Sprint 2 for:
- `compareList` — products added to comparison
- `watchlist` — bookmarked products
- `activeTab` — currently selected recommendation tab
- `activeCategory` — selected category filter
