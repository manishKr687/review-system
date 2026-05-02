# 01 — Project Setup Guide

## What is ReviewLens?

ReviewLens is a **read-only product intelligence platform**. Users can explore, compare, and understand products purely through review analysis. There is no purchasing, cart, or checkout — only insights.

---

## Tech Stack Explained

### Why Vite?
Vite is a modern build tool that replaces Create React App. It uses native ES Modules in development, making the dev server start near-instantly (< 300ms vs 10s+ with CRA). When you save a file, only that module reloads — not the whole app.

### Why React + TypeScript?
- **React** lets you build UI as small, reusable pieces (components). Each section of the dashboard (Sidebar, Header, ProductCard) is its own component.
- **TypeScript** adds types to JavaScript. If a component expects a `rating: number` and you pass a string, TypeScript catches it before the browser ever runs the code.

### Why Tailwind CSS?
Tailwind gives you utility classes like `bg-indigo-600`, `rounded-xl`, `flex`, `gap-4`. Instead of writing separate CSS files, you style directly in JSX. This keeps styles co-located with the component they style.

---

## Folder Structure

```
review-system/
│
├── index.html              ← Browser entry point. React mounts into <div id="root">
├── vite.config.ts          ← Tells Vite to use the React plugin
├── tailwind.config.js      ← Tells Tailwind which files to scan for class names
├── postcss.config.js       ← Runs Tailwind + Autoprefixer during CSS build
├── tsconfig.json           ← TypeScript rules for src/ files
├── tsconfig.node.json      ← TypeScript rules for config files (vite.config.ts)
├── package.json            ← All dependencies + npm scripts
│
├── src/
│   ├── main.tsx            ← Bootstraps React, renders <App> into the DOM
│   ├── App.tsx             ← Root layout: Sidebar + Header + Main + RightPanel
│   ├── index.css           ← Tailwind imports + global styles
│   │
│   ├── data/
│   │   └── mockData.ts     ← All fake product/review/category data (Sprint 1)
│   │
│   └── components/
│       ├── StarRating.tsx          ← Reusable star rating (used everywhere)
│       ├── Sidebar.tsx             ← Left navigation panel
│       ├── Header.tsx              ← Top bar: search, notifications, user
│       ├── HeroSection.tsx         ← Featured product with aspect bars
│       ├── CategoryPills.tsx       ← Scrollable category chips
│       ├── ProductCard.tsx         ← Individual product card with rank badge
│       ├── TopReviewedProducts.tsx ← Tabbed product grid section
│       ├── ReviewInsights.tsx      ← 4-stat insights bar
│       └── ReviewSummaryPanel.tsx  ← Right panel: summary + recently analyzed
│
└── docs/
    ├── 01-setup.md         ← This file
    ├── 02-architecture.md  ← How components connect
    └── 03-components.md    ← Each component explained in detail
```

---

## How to Initialize a New Project (Real-World Flow)

You never create `package.json` manually. One command scaffolds the entire project:

```bash
# Step 1 — Scaffold everything in one shot (generates package.json, vite.config.ts, tsconfig.json, index.html, src/main.tsx, src/App.tsx)
npm create vite@latest review-system -- --template react-ts

# Step 2 — Enter the project folder
cd review-system

# Step 3 — Install base dependencies
npm install

# Step 4 — Add extra packages used in ReviewLens
npm install lucide-react recharts react-router-dom zustand

# Step 5 — Add Tailwind and its build tools
npm install -D tailwindcss postcss autoprefixer

# Step 6 — Generate tailwind.config.js and postcss.config.js automatically
npx tailwindcss init -p

# Step 7 — Start the dev server
npm run dev
```

> **Why we created files manually in this project:**
> `npm create vite@latest` is interactive — it asks questions in the terminal which can't run in an automated environment. So all files were written directly. The result is identical.

---

## How to Run (Day-to-Day)

```bash
# Install all dependencies listed in package.json (run once, or after pulling new changes)
npm install

# Start the development server → http://localhost:5173
npm run dev

# Build for production (outputs to dist/)
npm run build

# Preview the production build locally → http://localhost:4173
npm run preview

# Type check without building
npx tsc --noEmit
```

---

## How the App Boots

```
Browser loads index.html
  └── loads src/main.tsx
        └── React renders <App />
              ├── <Sidebar />       (left panel)
              ├── <Header />        (top bar)
              ├── <HeroSection />   (featured product)
              ├── <CategoryPills /> (category row)
              ├── <TopReviewedProducts /> (product grid)
              ├── <ReviewInsights /> (stats bar)
              └── <ReviewSummaryPanel /> (right panel)
```

---

## Key Concepts for Beginners

### Components
A component is a function that returns JSX (HTML-like syntax). Example:

```tsx
function ProductCard({ name, rating }: { name: string; rating: number }) {
  return (
    <div className="bg-white rounded-xl p-4">
      <h3>{name}</h3>
      <p>Rating: {rating}</p>
    </div>
  );
}
```

### Props
Props are the inputs to a component. Like function arguments, they let you pass data from a parent to a child component.

### State
State is data that can change over time (e.g., which tab is selected). When state changes, React re-renders only the affected component.

### Tailwind Classes
`className="bg-white rounded-xl p-4 flex items-center gap-2"` means:
- `bg-white` → white background
- `rounded-xl` → border-radius: 12px
- `p-4` → padding: 16px (1rem)
- `flex` → display: flex
- `items-center` → align-items: center
- `gap-2` → gap: 8px between flex children
