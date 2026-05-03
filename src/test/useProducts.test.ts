import { renderHook, waitFor } from '@testing-library/react'
import { vi, beforeEach } from 'vitest'
import {
  useFeaturedProduct,
  useTopReviewed,
  useProducts,
  useProduct,
  useReviews,
  useSearch,
  useCategories,
} from '../hooks/useProducts'
import { mockApiProduct, mockApiReview, mockCategories } from './fixtures'

vi.mock('../api/products', () => ({
  fetchFeaturedProduct:  vi.fn(),
  fetchTopReviewed:      vi.fn(),
  fetchProducts:         vi.fn(),
  fetchProduct:          vi.fn(),
  fetchReviews:          vi.fn(),
  searchProducts:        vi.fn(),
  fetchCategories:       vi.fn(),
  fetchRecommendations:  vi.fn(),
  fetchStats:            vi.fn(),
  submitReview:          vi.fn(),
}))

import * as api from '../api/products'

beforeEach(() => {
  vi.mocked(api.fetchFeaturedProduct).mockResolvedValue(mockApiProduct)
  vi.mocked(api.fetchTopReviewed).mockResolvedValue([mockApiProduct])
  vi.mocked(api.fetchProducts).mockResolvedValue({ total: 1, products: [mockApiProduct] })
  vi.mocked(api.fetchProduct).mockImplementation(async (id) =>
    id === 1 ? mockApiProduct : (() => { throw new Error('not found') })()
  )
  vi.mocked(api.fetchReviews).mockResolvedValue({ total: 1, reviews: [mockApiReview] })
  vi.mocked(api.searchProducts).mockImplementation(async (q) =>
    q.toLowerCase().includes('iphone')
      ? { total: 1, products: [mockApiProduct] }
      : { total: 0, products: [] }
  )
  vi.mocked(api.fetchCategories).mockResolvedValue(mockCategories)
})

// ── useFeaturedProduct ────────────────────────────────────────────────────────

describe('useFeaturedProduct', () => {
  it('returns a product after loading', async () => {
    const { result } = renderHook(() => useFeaturedProduct())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toBeDefined()
    expect(result.current.data?.name).toBeTruthy()
  })
})

// ── useTopReviewed ────────────────────────────────────────────────────────────

describe('useTopReviewed', () => {
  it('returns products after loading', async () => {
    const { result } = renderHook(() => useTopReviewed())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(Array.isArray(result.current.data)).toBe(true)
    expect(result.current.data!.length).toBeGreaterThan(0)
  })

  it('passes category to the API', async () => {
    const { result } = renderHook(() => useTopReviewed('Phones'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(api.fetchTopReviewed).toHaveBeenCalledWith('Phones', 8)
  })
})

// ── useProducts ───────────────────────────────────────────────────────────────

describe('useProducts', () => {
  it('returns products after loading', async () => {
    const { result } = renderHook(() => useProducts())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data!.length).toBeGreaterThan(0)
  })

  it('passes filter params to the API', async () => {
    const { result } = renderHook(() => useProducts({ category: 'Phones', minRating: 4 }))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(api.fetchProducts).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'Phones', min_rating: 4 })
    )
  })
})

// ── useProduct ────────────────────────────────────────────────────────────────

describe('useProduct', () => {
  it('returns a product for a valid id', async () => {
    const { result } = renderHook(() => useProduct(1))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data?.name).toBe('Apple iPhone 15')
  })

  it('returns null for an unknown id', async () => {
    vi.mocked(api.fetchProduct).mockRejectedValueOnce(new Error('not found'))
    const { result } = renderHook(() => useProduct(99999))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBeTruthy()
  })

  it('includes pros, cons, highlights', async () => {
    const { result } = renderHook(() => useProduct(1))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(Array.isArray(result.current.data?.pros)).toBe(true)
    expect(Array.isArray(result.current.data?.cons)).toBe(true)
    expect(Array.isArray(result.current.data?.highlights)).toBe(true)
  })
})

// ── useReviews ────────────────────────────────────────────────────────────────

describe('useReviews', () => {
  it('returns reviews after loading', async () => {
    const { result } = renderHook(() => useReviews(1))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data!.length).toBeGreaterThan(0)
  })

  it('passes sentiment filter to API', async () => {
    const { result } = renderHook(() => useReviews(1, 'positive'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(api.fetchReviews).toHaveBeenCalledWith(1, expect.objectContaining({ sentiment: 'positive' }))
  })

  it('passes verified_only filter to API', async () => {
    const { result } = renderHook(() => useReviews(1, 'verified'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(api.fetchReviews).toHaveBeenCalledWith(1, expect.objectContaining({ verified_only: true }))
  })
})

// ── useSearch ─────────────────────────────────────────────────────────────────

describe('useSearch', () => {
  it('returns empty array for empty query without calling API', async () => {
    const { result } = renderHook(() => useSearch(''))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual([])
    expect(api.searchProducts).not.toHaveBeenCalled()
  })

  it('returns matching products for a valid query', async () => {
    const { result } = renderHook(() => useSearch('iphone'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data!.length).toBeGreaterThan(0)
    expect(result.current.data![0].name).toMatch(/iPhone/i)
  })

  it('returns empty array for no-match query', async () => {
    const { result } = renderHook(() => useSearch('xyznotaproduct'))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual([])
  })
})

// ── useCategories ─────────────────────────────────────────────────────────────

describe('useCategories', () => {
  it('returns category list after loading', async () => {
    const { result } = renderHook(() => useCategories())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data!.length).toBeGreaterThan(0)
    expect(result.current.data![0]).toHaveProperty('name')
    expect(result.current.data![0]).toHaveProperty('icon')
  })
})
