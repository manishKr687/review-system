import { useEffect, useState } from 'react'
import {
  fetchCategories,
  fetchFeaturedProduct,
  fetchProduct,
  fetchProducts,
  fetchReviews,
  fetchRecommendations,
  fetchStats,
  fetchTopReviewed,
  searchProducts as apiFetchSearch,
  type RecommendationType,
  type SiteStats,
} from '../api/products'
import type { ApiProduct, ApiReview } from '../api/types'
import type { Product, Review, RecommendationScores } from '../data/mockData'

// ── Adapters ─────────────────────────────────────────────────────────────────

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
    aspects: p.aspects,
    ...colors,
    scores: p.scores as RecommendationScores | undefined,
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
    isSuspicious: r.is_suspicious,
  }
}

// ── Core hook ─────────────────────────────────────────────────────────────────

interface HookState<T> {
  data: T | undefined
  loading: boolean
  error: string | null
}

function useApiCall<T>(
  apiFetcher: () => Promise<T>,
  deps: unknown[],
): HookState<T> {
  const [state, setState] = useState<HookState<T>>({ data: undefined, loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    setState({ data: undefined, loading: true, error: null })
    apiFetcher()
      .then(d  => { if (!cancelled) setState({ data: d,         loading: false, error: null        }) })
      .catch(e => { if (!cancelled) setState({ data: undefined, loading: false, error: String(e)   }) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}

// ── Public hooks ──────────────────────────────────────────────────────────────

export function useFeaturedProduct() {
  return useApiCall(
    async () => adaptProduct(await fetchFeaturedProduct(), 1),
    [],
  )
}

export function useTopReviewed(category?: string) {
  return useApiCall(
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
  return useApiCall(
    async () => {
      const res = await fetchProducts({
        category:   params.category,
        min_rating: params.minRating,
        max_price:  params.maxPrice,
        sort:       params.sort,
      })
      return res.products.map((p, i) => adaptProduct(p, i + 1))
    },
    [params.category, params.minRating, params.maxPrice, params.sort],
  )
}

export type ProductWithSummary = Product & { pros: string[]; cons: string[]; highlights: string[] }

export function useProduct(id: number) {
  return useApiCall<ProductWithSummary | null>(
    async () => {
      const p = await fetchProduct(id)
      return { ...adaptProduct(p), pros: p.pros ?? [], cons: p.cons ?? [], highlights: p.highlights ?? [] }
    },
    [id],
  )
}

export function useReviews(productId: number, filter = 'all') {
  return useApiCall(
    async () => {
      const res = await fetchReviews(productId, {
        sentiment:    filter !== 'verified' && filter !== 'all' ? filter : undefined,
        verified_only: filter === 'verified',
      })
      return res.reviews.map(adaptReview)
    },
    [productId, filter],
  )
}

export function useSearch(query: string) {
  return useApiCall(
    async () => {
      if (!query.trim()) return []
      const res = await apiFetchSearch(query)
      return res.products.map((p, i) => adaptProduct(p, i + 1))
    },
    [query],
  )
}

export function useRecommendations(
  type: RecommendationType = 'top_rated',
  limit = 8,
  category?: string,
) {
  return useApiCall(
    async () => {
      const list = await fetchRecommendations(type, limit, category)
      return list.map((p, i) => adaptProduct(p, i + 1))
    },
    [type, limit, category],
  )
}

export function useStats() {
  return useApiCall<SiteStats>(() => fetchStats(), [])
}

export function useCategories() {
  return useApiCall(() => fetchCategories(), [])
}
