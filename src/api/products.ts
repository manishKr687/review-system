import { apiFetch, apiPost } from './client'
import type { ApiProduct, Category, ProductsResponse, ReviewsResponse } from './types'

export function fetchProducts(params: {
  category?: string
  min_rating?: number
  max_price?: number
  sort?: string
  limit?: number
} = {}): Promise<ProductsResponse> {
  const qs = new URLSearchParams()
  if (params.category) qs.set('category', params.category)
  if (params.min_rating) qs.set('min_rating', String(params.min_rating))
  if (params.max_price) qs.set('max_price', String(params.max_price))
  if (params.sort) qs.set('sort', params.sort)
  if (params.limit) qs.set('limit', String(params.limit))
  const q = qs.toString()
  return apiFetch<ProductsResponse>(`/api/products${q ? `?${q}` : ''}`)
}

export function fetchFeaturedProduct(): Promise<ApiProduct> {
  return apiFetch<ApiProduct>('/api/products/featured')
}

export function fetchTopReviewed(category?: string, limit = 8): Promise<ApiProduct[]> {
  const qs = new URLSearchParams({ limit: String(limit) })
  if (category) qs.set('category', category)
  return apiFetch<ApiProduct[]>(`/api/products/top-reviewed?${qs}`)
}

export function fetchProduct(id: number): Promise<ApiProduct> {
  return apiFetch<ApiProduct>(`/api/products/${id}`)
}

export function fetchReviews(productId: number, params: {
  sentiment?: string
  verified_only?: boolean
} = {}): Promise<ReviewsResponse> {
  const qs = new URLSearchParams()
  if (params.sentiment && params.sentiment !== 'all') qs.set('sentiment', params.sentiment)
  if (params.verified_only) qs.set('verified_only', 'true')
  const q = qs.toString()
  return apiFetch<ReviewsResponse>(`/api/reviews/${productId}${q ? `?${q}` : ''}`)
}

export function searchProducts(q: string): Promise<ProductsResponse> {
  return apiFetch<ProductsResponse>(`/api/search?q=${encodeURIComponent(q)}`)
}

export function fetchCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/api/categories')
}

export type RecommendationType = 'top_rated' | 'best_value' | 'trending' | 'gaming' | 'photography' | 'travel'

export interface SiteStats {
  total_reviews: number
  total_products: number
  avg_rating: number
  positive_pct: number
  star_distribution: { star: number; percent: number }[]
}

export function fetchStats(): Promise<SiteStats> {
  return apiFetch<SiteStats>('/api/stats')
}

export interface ReviewPayload {
  author: string
  rating: number
  title: string
  body: string
}

export function submitReview(productId: number, payload: ReviewPayload): Promise<import('./types').ApiReview> {
  return apiPost(`/api/reviews/${productId}`, payload)
}

export interface MyReview {
  id: number
  product_id: number
  product_name: string
  product_icon: string
  author: string
  rating: number
  title: string
  body: string
  sentiment: 'positive' | 'negative' | 'neutral'
  verified: boolean
  helpful: number
  date: string
  is_suspicious: boolean
  status: string
}

export function fetchMyReviews(): Promise<MyReview[]> {
  return apiFetch<MyReview[]>('/api/reviews/mine')
}

export function fetchRecommendations(
  type: RecommendationType = 'top_rated',
  limit = 8,
  category?: string,
): Promise<ApiProduct[]> {
  const qs = new URLSearchParams({ type, limit: String(limit) })
  if (category) qs.set('category', category)
  return apiFetch<ApiProduct[]>(`/api/recommendations?${qs}`)
}
