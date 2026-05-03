const BASE = import.meta.env.VITE_API_URL ?? ''
const STORAGE_KEY = 'rl_admin_key'

export class AdminApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export function getStoredKey(): string {
  return localStorage.getItem(STORAGE_KEY) ?? ''
}

export function storeKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key)
}

export function clearKey(): void {
  localStorage.removeItem(STORAGE_KEY)
}

async function adminFetch<T>(
  path: string,
  options: RequestInit = {},
  key = getStoredKey(),
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': key,
      ...(options.headers ?? {}),
    },
  })
  if (res.status === 401) throw new AdminApiError(401, 'Invalid admin key')
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new AdminApiError(res.status, body.detail ?? `Error ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface AdminProduct {
  id: number
  name: string
  brand: string
  category: string
  price: number
  rating: number
  review_count: number
  icon: string
  quote: string
  aspects: Record<string, number>
  pros: string[]
  cons: string[]
  highlights: string[]
}

export type ProductCreate = Omit<AdminProduct, 'id'>
export type ProductUpdate = Partial<ProductCreate>

export interface AdminStats {
  total_products: number
  total_reviews: number
  sentiment_breakdown: Record<string, number>
  categories: Record<string, number>
}

export interface AnalyseResponse {
  task_id: string
  status: string
  message: string
}

// ── API calls ─────────────────────────────────────────────────────────────────

export function verifyAdminKey(key: string): Promise<AdminStats> {
  return adminFetch<AdminStats>('/api/admin/stats', {}, key)
}

export function fetchAdminStats(): Promise<AdminStats> {
  return adminFetch<AdminStats>('/api/admin/stats')
}

export function fetchAdminProducts(params: {
  category?: string
  search?: string
  limit?: number
  offset?: number
} = {}): Promise<AdminProduct[]> {
  const qs = new URLSearchParams()
  if (params.category) qs.set('category', params.category)
  if (params.search) qs.set('search', params.search)
  if (params.limit) qs.set('limit', String(params.limit))
  if (params.offset) qs.set('offset', String(params.offset))
  const q = qs.toString()
  return adminFetch<AdminProduct[]>(`/api/admin/products${q ? `?${q}` : ''}`)
}

export function createProduct(data: ProductCreate): Promise<AdminProduct> {
  return adminFetch<AdminProduct>('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateProduct(id: number, data: ProductUpdate): Promise<AdminProduct> {
  return adminFetch<AdminProduct>(`/api/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteProduct(id: number): Promise<void> {
  return adminFetch<void>(`/api/admin/products/${id}`, { method: 'DELETE' })
}

export function triggerAnalysis(): Promise<AnalyseResponse> {
  return adminFetch<AnalyseResponse>('/api/admin/analyse', { method: 'POST' })
}

// ── Review moderation ─────────────────────────────────────────────────────────

export interface AdminReview {
  id: number
  product_id: number
  product_name: string
  author: string
  rating: number
  title: string
  body: string
  sentiment: string
  verified: boolean
  helpful: number
  date: string
  is_suspicious: boolean
  status: string
  reviewer_ip: string | null
}

export function fetchPendingCount(): Promise<{ pending: number }> {
  return adminFetch<{ pending: number }>('/api/admin/reviews/pending/count')
}

export function fetchPendingReviews(): Promise<AdminReview[]> {
  return adminFetch<AdminReview[]>('/api/admin/reviews/pending')
}

export function approveReview(id: number, verified = false): Promise<AdminReview> {
  return adminFetch<AdminReview>(`/api/admin/reviews/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ verified }),
  })
}

export function rejectReview(id: number): Promise<AdminReview> {
  return adminFetch<AdminReview>(`/api/admin/reviews/${id}/reject`, { method: 'POST' })
}

export function adminDeleteReview(id: number): Promise<void> {
  return adminFetch<void>(`/api/admin/reviews/${id}`, { method: 'DELETE' })
}
