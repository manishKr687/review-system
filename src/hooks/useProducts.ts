import { useEffect, useMemo, useState } from 'react'
import {
  API_ENABLED,
  fetchCategories,
  fetchFeaturedProduct,
  fetchProduct,
  fetchProducts,
  fetchReviews,
  fetchTopReviewed,
  searchProducts as apiFetchSearch,
} from '../api/products'
import type { ApiProduct, ApiReview } from '../api/types'
import {
  allProducts,
  getProductById,
  getProductSummary,
  getReviewsByProductId,
  heroProduct,
  reviews as mockReviews,
  searchProducts as mockSearch,
  getProductsByCategory,
} from '../data/mockData'
import type { Product, Review } from '../data/mockData'

// ── Adapter: ApiProduct → mock Product ──────────────────────────────────────

const CATEGORY_COLORS: Record<string, { bgFrom: string; bgTo: string; phoneColor: string }> = {
  Phones:       { bgFrom: 'from-blue-100',   bgTo: 'to-blue-200',   phoneColor: '#1D4ED8' },
  Laptops:      { bgFrom: 'from-gray-100',   bgTo: 'to-gray-200',   phoneColor: '#6B7280' },
  Headphones:   { bgFrom: 'from-amber-100',  bgTo: 'to-amber-200',  phoneColor: '#92400E' },
  Smartwatches: { bgFrom: 'from-pink-100',   bgTo: 'to-pink-200',   phoneColor: '#BE185D' },
  Cameras:      { bgFrom: 'from-zinc-100',   bgTo: 'to-zinc-200',   phoneColor: '#3F3F46' },
  Tablets:      { bgFrom: 'from-indigo-100', bgTo: 'to-indigo-200', phoneColor: '#3730A3' },
}

function adaptProduct(p: ApiProduct, rank = 0): Product {
  const colors = CATEGORY_COLORS[p.category] ?? { bgFrom: 'from-gray-100', bgTo: 'to-gray-200', phoneColor: '#374151' }
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    priceRange: `$${p.price.toLocaleString()}`,
    rating: p.rating,
    reviewCount: p.review_count,
    rank,
    icon: p.icon,
    quote: p.quote,
    aspects: {
      camera: p.aspects.camera ?? 0,
      battery: p.aspects.battery ?? 0,
      performance: p.aspects.performance ?? 0,
      display: p.aspects.display ?? 0,
    },
    ...colors,
  }
}

function adaptReview(r: ApiReview): Review {
  const words = r.author.split(' ')
  const initials = words.map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase()
  return {
    id: r.id,
    productId: r.product_id,
    author: r.author,
    initials,
    rating: r.rating,
    text: r.body,
    date: r.date,
    verified: r.verified,
    helpfulVotes: r.helpful,
    sentiment: r.sentiment,
  }
}

// ── Hook result type ─────────────────────────────────────────────────────────

interface HookState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

// Dual-mode hook helper: returns mock data synchronously; API data asynchronously.
// This keeps existing tests passing (they don't need waitFor) while enabling real
// API calls when VITE_API_URL is set.
function useDualMode<T>(
  mockValue: T,        // computed synchronously in calling hook via useMemo
  apiFetcher: () => Promise<T>,
  apsDeps: unknown[],  // deps that trigger a new API fetch
): HookState<T> {
  const [apiState, setApiState] = useState<HookState<T>>({ data: null, loading: true, error: null })

  useEffect(() => {
    if (!API_ENABLED) return
    let cancelled = false
    setApiState({ data: null, loading: true, error: null })
    apiFetcher()
      .then(d => { if (!cancelled) setApiState({ data: d, loading: false, error: null }) })
      .catch(e => { if (!cancelled) setApiState({ data: null, loading: false, error: String(e) }) })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, apsDeps)

  // Mock mode: return synchronously so tests don't need waitFor
  if (!API_ENABLED) return { data: mockValue, loading: false, error: null }
  return apiState
}

// ── Public hooks ─────────────────────────────────────────────────────────────

export function useFeaturedProduct() {
  const mockValue = useMemo(() => heroProduct, [])
  return useDualMode(
    mockValue,
    async () => adaptProduct(await fetchFeaturedProduct(), 1),
    [],
  )
}

export function useTopReviewed(category?: string) {
  const mockValue = useMemo(
    () => category ? getProductsByCategory(category) : allProducts.slice(0, 8),
    [category],
  )
  return useDualMode(
    mockValue,
    async () => {
      const list = await fetchTopReviewed(category, 8)
      return list.map((p, i) => adaptProduct(p, i + 1))
    },
    [category],
  )
}

export function useProducts(params: {
  category?: string
  minRating?: number
  maxPrice?: number
  sort?: string
} = {}) {
  const mockValue = useMemo(() => allProducts, [])
  return useDualMode(
    mockValue,
    async () => {
      const res = await fetchProducts({
        category: params.category,
        min_rating: params.minRating,
        max_price: params.maxPrice,
        sort: params.sort,
      })
      return res.products.map((p, i) => adaptProduct(p, i + 1))
    },
    [params.category, params.minRating, params.maxPrice, params.sort],
  )
}

export type ProductWithSummary = Product & { pros: string[]; cons: string[]; highlights: string[] }

export function useProduct(id: number) {
  const mockValue = useMemo<ProductWithSummary | null>(() => {
    const product = getProductById(id)
    if (!product) return null
    const summary = getProductSummary(id)
    return { ...product, pros: summary?.pros ?? [], cons: summary?.cons ?? [], highlights: summary?.highlights ?? [] }
  }, [id])

  return useDualMode<ProductWithSummary | null>(
    mockValue,
    async () => {
      const p = await fetchProduct(id)
      return { ...adaptProduct(p), pros: p.pros ?? [], cons: p.cons ?? [], highlights: p.highlights ?? [] }
    },
    [id],
  )
}

export function useReviews(productId: number, filter: string = 'all') {
  const mockValue = useMemo(() => {
    const all = getReviewsByProductId(productId).length
      ? getReviewsByProductId(productId)
      : mockReviews.filter(r => r.productId === productId)
    if (filter === 'positive') return all.filter(r => r.sentiment === 'positive')
    if (filter === 'negative') return all.filter(r => r.sentiment === 'negative')
    if (filter === 'verified') return all.filter(r => r.verified)
    return all
  }, [productId, filter])

  return useDualMode(
    mockValue,
    async () => {
      const res = await fetchReviews(productId, {
        sentiment: filter !== 'verified' ? filter : undefined,
        verified_only: filter === 'verified',
      })
      return res.reviews.map(adaptReview)
    },
    [productId, filter],
  )
}

export function useSearch(query: string) {
  const mockValue = useMemo(
    () => (query.trim() ? mockSearch(query) : []),
    [query],
  )
  return useDualMode(
    mockValue,
    async () => {
      if (!query.trim()) return []
      const res = await apiFetchSearch(query)
      return res.products.map((p, i) => adaptProduct(p, i + 1))
    },
    [query],
  )
}

export function useCategories() {
  const mockValue = useMemo(() => [
    { name: 'Smartphones', icon: '📱' },
    { name: 'Laptops',     icon: '💻' },
    { name: 'Headphones',  icon: '🎧' },
    { name: 'Smartwatches',icon: '⌚' },
    { name: 'Cameras',     icon: '📷' },
  ], [])

  return useDualMode(
    mockValue,
    () => fetchCategories(),
    [],
  )
}
