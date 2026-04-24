import { apiFetch } from './client'
import type { ApiProduct, Category, ProductsResponse, ReviewsResponse } from './types'

export const API_ENABLED = Boolean(import.meta.env.VITE_API_URL)

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
