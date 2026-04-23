import { create } from 'zustand';

interface ReviewLensStore {
  // Compare — max 4 products side-by-side
  compareList: number[];
  addToCompare: (id: number) => void;
  removeFromCompare: (id: number) => void;
  clearCompare: () => void;
  isInCompare: (id: number) => boolean;

  // Watchlist / bookmarks
  watchlist: number[];
  toggleWatchlist: (id: number) => void;
  isInWatchlist: (id: number) => boolean;

  // Search query (shared across Header + SearchResults)
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const useStore = create<ReviewLensStore>((set, get) => ({
  // ── Compare ────────────────────────────────────────────────────────────────
  compareList: [],

  addToCompare: (id) => set((s) => {
    if (s.compareList.includes(id) || s.compareList.length >= 4) return s;
    return { compareList: [...s.compareList, id] };
  }),

  removeFromCompare: (id) => set((s) => ({
    compareList: s.compareList.filter(i => i !== id),
  })),

  clearCompare: () => set({ compareList: [] }),

  isInCompare: (id) => get().compareList.includes(id),

  // ── Watchlist ──────────────────────────────────────────────────────────────
  watchlist: [],

  toggleWatchlist: (id) => set((s) => ({
    watchlist: s.watchlist.includes(id)
      ? s.watchlist.filter(i => i !== id)
      : [...s.watchlist, id],
  })),

  isInWatchlist: (id) => get().watchlist.includes(id),

  // ── Search ─────────────────────────────────────────────────────────────────
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
}));
