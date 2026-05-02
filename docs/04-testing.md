# 04 — Testing Guide

## Tools Used

| Tool | Role |
|------|------|
| **Vitest** | Test runner — finds and runs all `*.test.tsx` files |
| **React Testing Library** | Renders components and lets you query what's on screen |
| **@testing-library/jest-dom** | Adds matchers like `toBeInTheDocument()`, `toHaveClass()` |
| **@testing-library/user-event** | Simulates real user actions (click, type, keyboard) |
| **jsdom** | Fakes a browser DOM inside Node.js so tests run without a real browser |

---

## Commands

```bash
npm test              # watch mode — re-runs tests on every file save
npm run test:run      # run once and exit (good for CI)
npm run test:coverage # run once + generate a coverage report in /coverage
```

---

## How It's Configured

### `vite.config.ts`
```ts
test: {
  globals: true,         // no need to import describe/it/expect
  environment: 'jsdom',  // simulates the browser
  setupFiles: './src/test/setup.ts',
}
```

### `src/test/setup.ts`
```ts
import '@testing-library/jest-dom'
// Loads custom matchers: toBeInTheDocument, toHaveClass, toHaveValue, etc.
```

### `tsconfig.json`
```json
"types": ["vitest/globals"]
// Tells TypeScript that describe/it/expect are valid globals
```

---

## Folder Structure

```
src/
└── test/
    ├── setup.ts                      ← Loads jest-dom matchers globally
    ├── StarRating.test.tsx           ← Unit tests for the star renderer
    ├── HeroSection.test.tsx          ← Tests for the hero banner
    ├── Header.test.tsx               ← Tests for the top bar
    └── TopReviewedProducts.test.tsx  ← Tests for tabs + product grid
```

---

## The 3 Core Functions

### `render(component)`
Mounts the component into a fake DOM. Always the first step.

```tsx
render(<StarRating rating={4} />)
```

### `screen.getBy...()`
Queries the rendered output. Throws if not found (test fails immediately).

```tsx
screen.getByText('Overall Best')        // by visible text
screen.getByRole('button', { name: /search/i }) // by ARIA role
screen.getByPlaceholderText(/Search products/i) // by input placeholder
```

### `userEvent`
Simulates real user interaction — more realistic than `fireEvent`.

```tsx
const user = userEvent.setup()
await user.click(button)
await user.type(input, 'gaming laptop')
```

---

## What Each Test File Covers

### `StarRating.test.tsx`
| Test | What it checks |
|------|---------------|
| renders 5 star elements | Always renders exactly 5 `<svg>` icons |
| fills correct stars for whole number | rating=3 → 3 amber, 2 gray |
| half-star rating → amber | rating=4.5 → all 5 amber |
| rating 0 → all empty | 5 gray stars |
| xs size class | SVG has `w-3 h-3` |
| lg size class | SVG has `w-5 h-5` |

### `Header.test.tsx`
| Test | What it checks |
|------|---------------|
| search input renders | Input with correct placeholder exists |
| Search button renders | Button with text "Search" exists |
| Write a Review renders | Link text visible |
| user name renders | "Rahul" is on screen |
| notification badge | Shows count "3" |
| typing in search | Input value updates correctly |

### `HeroSection.test.tsx`
| Test | What it checks |
|------|---------------|
| headline renders | "Find the best products" text present |
| overall rating value | `4.6` displayed |
| review count | "12,342 reviews" present |
| 4 aspect labels | Camera, Battery, Performance, Display |
| 4 aspect scores | Correct score values from mock data |

### `TopReviewedProducts.test.tsx`
| Test | What it checks |
|------|---------------|
| all 4 tabs render | Overall Best, Best Value, Top Rated, Trending |
| default active tab | "Overall Best" has indigo background |
| tab switching | Clicking "Best Value" makes it active |
| product names | All 4 products from mockData appear |
| section heading | "Top Reviewed Products" present |
| Filters button | Filter button is visible |

---

## Matchers Cheat Sheet

```tsx
expect(element).toBeInTheDocument()       // element exists in DOM
expect(element).toHaveClass('bg-indigo-600') // has Tailwind class
expect(element).not.toHaveClass('text-white') // does NOT have class
expect(input).toHaveValue('gaming laptop')    // input has this value
expect(element).toHaveLength(5)           // array has 5 items
```

---

## When to Write Tests (Sprint Guide)

| Sprint | Write tests for |
|--------|----------------|
| 1 | ✅ StarRating, Header, HeroSection, TopReviewedProducts (done) |
| 2 | Router navigation, filter logic, compare state |
| 3 | All API endpoints (pytest), response schemas |
| 4 | Sentiment function, aspect extraction accuracy |
| 5 | Ranking formula, recommendation correctness |
| 6 | Auth flows, watchlist, fake review detection |

---

## Adding a New Test

1. Create `src/test/MyComponent.test.tsx`
2. Import the component + testing utilities
3. Write `describe` + `it` blocks

```tsx
import { render, screen } from '@testing-library/react'
import MyComponent from '../components/MyComponent'

describe('MyComponent', () => {
  it('renders the title', () => {
    render(<MyComponent title="Hello" />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```
