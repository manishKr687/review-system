# 03 — Components Guide

Every UI piece in ReviewLens is a **React component** — an isolated, reusable function that renders part of the screen. This file explains what each component does, what data it receives, and how it fits into the layout.

---

## Component Map

```
App.tsx  ←  Root layout (3-column shell)
├── Sidebar.tsx
├── Header.tsx
├── HeroSection.tsx
├── CategoryPills.tsx
├── TopReviewedProducts.tsx
│   └── ProductCard.tsx   (rendered ×4)
├── ReviewInsights.tsx
└── ReviewSummaryPanel.tsx
    └── StarRating.tsx    (rendered multiple times)

StarRating.tsx  ←  Shared utility, used by HeroSection, ProductCard, ReviewSummaryPanel
```

---

## `StarRating.tsx`

**What it does:** Renders 1–5 star icons filled based on a decimal rating.

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rating` | `number` | required | e.g. `4.6` |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Controls icon size |

**How it works:**
```tsx
// For rating = 4.6:
// Star 1 → filled  (1 ≤ 4)
// Star 2 → filled  (2 ≤ 4)
// Star 3 → filled  (3 ≤ 4)
// Star 4 → filled  (4 ≤ 4)
// Star 5 → half    (4.5 ≤ 4.6, but 5 > 4) → amber color
```

**Used by:** `HeroSection`, `ProductCard`, `ReviewSummaryPanel`

---

## `Sidebar.tsx`

**What it does:** The fixed left navigation panel. Always visible regardless of scroll.

**Sections:**
1. **Logo** — ReviewLens brand mark + tagline
2. **Nav items** — 8 primary nav links (Home, Top Rated, Categories, etc.)
3. **My Activity** — 3 secondary links (Recently Viewed, Helpful Reviews, Liked Reviews)
4. **Share card** — CTA card with indigo-600 background prompting users to write a review

**State:** None in Sprint 1. Sprint 2 will add `activeRoute` from React Router.

**Key Tailwind patterns:**
```tsx
// Active nav item
'bg-indigo-50 text-indigo-700'

// Inactive nav item (default)
'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
```

---

## `Header.tsx`

**What it does:** Top bar with search, actions, and user identity.

**Elements:**
| Element | Description |
|---------|-------------|
| Search input | Full-width input with focus ring. Sprint 3 will wire to `/products/search` |
| Search button | Indigo button, triggers search |
| Write a Review | Ghost button with pen icon |
| Notification bell | Red badge showing unread count (hardcoded `3` in Sprint 1) |
| User avatar | Gradient circle with initial `R`, shows user name + dropdown chevron |

**Props:** None (reads from global auth state in Sprint 6)

---

## `HeroSection.tsx`

**What it does:** The main banner — highlights the top-ranked product with its rating and aspect breakdown.

**Sub-parts:**
| Part | Description |
|------|-------------|
| Headline | "Find the best products based on real reviews" |
| `PhoneIllustration` | Inline SVG rendering a stylized phone graphic in the product's brand color |
| Overall Rating | Large number + `StarRating` + review count |
| Aspect bars | 4 horizontal progress bars (Camera, Battery, Performance, Display) using emerald-500 |

**Data source:** `heroProduct` from `mockData.ts` (= `topProducts[0]` = iPhone 15)

**Aspect bar formula:**
```tsx
// bar width = (score / 5) * 100%
// e.g. Camera 4.7 → (4.7 / 5) * 100 = 94%
style={{ width: `${(score / 5) * 100}%` }}
```

---

## `CategoryPills.tsx`

**What it does:** A horizontally scrollable row of category chips.

**Each chip shows:**
- Emoji icon for the category
- Category name
- Review count (formatted with commas)

**Data source:** `categories[]` from `mockData.ts`

**Interaction:** Hover shows indigo border + increased shadow. Sprint 2 will navigate to the category browse page on click.

---

## `ProductCard.tsx`

**What it does:** A single product card in the Top Reviewed Products grid.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| `product` | `Product` | Full product object from `mockData.ts` |

**Card layout (top to bottom):**
1. **Image area** — gradient background (`bgFrom`/`bgTo`) + inline SVG phone + rank badge
2. **Product name** — bold, truncated if too long
3. **Star rating + count** — using `StarRating` component
4. **Quote** — italic excerpt from top review
5. **View all reviews** — indigo link with arrow icon
6. **Footer** — "X reviews analyzed" in light gray

**Rank badge colors:**
```tsx
// #1 → amber-500  (gold)
// #2 → orange-400
// #3 → orange-400
// #4 → gray-300   (plain)
```

---

## `TopReviewedProducts.tsx`

**What it does:** The main product grid section with tab filtering.

**Sections:**
1. Section header ("Top Reviewed Products" + "View all →")
2. **Tab group** — `Overall Best | Best Value | Top Rated | Trending`
3. **4-column grid** of `ProductCard` components
4. **Right scroll arrow** — ChevronRight for future carousel

**State:**
```tsx
const [activeTab, setActiveTab] = useState('Overall Best');
```
The active tab gets `bg-indigo-600 text-white`. Inactive tabs are `text-gray-500`. In Sprint 5 this will filter the product list by the recommendation algorithm type.

---

## `ReviewInsights.tsx`

**What it does:** 4-stat summary bar showing platform-wide review analytics.

**Stats (from `insightStats[]` in mockData):**
| Value | Label | Color |
|-------|-------|-------|
| 12,342 | Total Reviews Analyzed | blue-500 |
| 97% | Positive Sentiment | emerald-500 |
| 24 | Products Compared | violet-500 |
| 15+ | Aspects Analyzed | amber-500 |

Each stat is a white card with a large emoji icon + metric + label.

---

## `ReviewSummaryPanel.tsx`

**What it does:** The fixed right panel. Always visible, shows aggregated platform stats for the currently featured product.

**Three sections:**

### 1. Review Summary
- Overall rating (large number + `StarRating`)
- Total review count in Indian format (`1,25,430`)
- Star distribution bars — blue-500 bars, percentage labels
- "See all reviews →" link

### 2. What People Love
- Green `CheckCircle2` icons from Lucide
- List from `whatPeopleLove[]` in mockData

### 3. Recently Analyzed
- 3 product thumbnails with emoji in gradient boxes
- Product name + `StarRating` + review count
- "View all →" link

**Data sources:**
```tsx
overallRating        → 4.6
totalReviewCount     → 125430
starDistribution[]   → [{ star: 5, percent: 72 }, ...]
whatPeopleLove[]     → [{ label: 'Camera Quality' }, ...]
recentlyAnalyzed[]   → [{ name, rating, reviewCount, icon, ... }, ...]
```

---

## How to Add a New Component

1. Create `src/components/MyComponent.tsx`
2. Export a default function
3. Import it in `App.tsx` (or wherever it belongs)
4. Add its props type above the function

```tsx
// src/components/MyComponent.tsx

interface MyComponentProps {
  title: string;
  count: number;
}

export default function MyComponent({ title, count }: MyComponentProps) {
  return (
    <div className="bg-white rounded-xl p-4">
      <h3 className="font-bold">{title}</h3>
      <p className="text-gray-500">{count} items</p>
    </div>
  );
}
```

---

## Shared Design Patterns

### Card wrapper
```tsx
<div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4">
```

### Section header
```tsx
<div className="flex items-center justify-between mb-4">
  <h2 className="text-lg font-bold text-gray-900">Section Title</h2>
  <button className="text-sm text-indigo-600 font-medium flex items-center gap-1">
    View all <ArrowRight className="w-3.5 h-3.5" />
  </button>
</div>
```

### Progress bar
```tsx
<div className="flex-1 bg-gray-100 rounded-full h-1.5">
  <div className="bg-emerald-500 rounded-full h-1.5" style={{ width: `${percent}%` }} />
</div>
```
