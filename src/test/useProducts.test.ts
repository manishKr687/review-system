import { renderHook } from '@testing-library/react'
import {
  useFeaturedProduct,
  useTopReviewed,
  useProducts,
  useProduct,
  useReviews,
  useSearch,
  useCategories,
} from '../hooks/useProducts'

// All tests run with VITE_API_URL='' (set in vitest config) so mock mode is always active.

describe('useFeaturedProduct', () => {
  it('returns a product synchronously', () => {
    const { result } = renderHook(() => useFeaturedProduct())
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toBeDefined()
    expect(result.current.data?.name).toBeTruthy()
  })
})

describe('useTopReviewed', () => {
  it('returns up to 8 products with no category', () => {
    const { result } = renderHook(() => useTopReviewed())
    expect(result.current.loading).toBe(false)
    expect(Array.isArray(result.current.data)).toBe(true)
    expect(result.current.data!.length).toBeLessThanOrEqual(8)
  })

  it('filters by category', () => {
    const { result } = renderHook(() => useTopReviewed('Smartphones'))
    expect(result.current.data!.every(p => p.category === 'Smartphones')).toBe(true)
  })

  it('returns empty array for unknown category', () => {
    const { result } = renderHook(() => useTopReviewed('UnknownCategory'))
    expect(result.current.data).toEqual([])
  })
})

describe('useProducts', () => {
  it('returns all products with no params', () => {
    const { result } = renderHook(() => useProducts())
    expect(result.current.loading).toBe(false)
    expect(result.current.data!.length).toBeGreaterThan(0)
  })

  it('returns data synchronously (no loading flash)', () => {
    const { result } = renderHook(() => useProducts({ category: 'Laptops' }))
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })
})

describe('useProduct', () => {
  it('returns a product for a valid id', () => {
    const { result } = renderHook(() => useProduct(1))
    expect(result.current.data).not.toBeNull()
    expect(result.current.data?.name).toBe('Apple iPhone 15')
  })

  it('returns null for an unknown id', () => {
    const { result } = renderHook(() => useProduct(99999))
    expect(result.current.data).toBeNull()
  })

  it('includes pros, cons, highlights', () => {
    const { result } = renderHook(() => useProduct(1))
    expect(Array.isArray(result.current.data?.pros)).toBe(true)
    expect(Array.isArray(result.current.data?.cons)).toBe(true)
    expect(Array.isArray(result.current.data?.highlights)).toBe(true)
  })
})

describe('useReviews', () => {
  it('returns reviews for a product', () => {
    const { result } = renderHook(() => useReviews(1))
    expect(result.current.loading).toBe(false)
    expect(result.current.data!.length).toBeGreaterThan(0)
  })

  it('filters to positive sentiment', () => {
    const { result } = renderHook(() => useReviews(1, 'positive'))
    const reviews = result.current.data!
    expect(reviews.every(r => r.sentiment === 'positive')).toBe(true)
  })

  it('filters to negative sentiment', () => {
    const { result } = renderHook(() => useReviews(1, 'negative'))
    const reviews = result.current.data!
    expect(reviews.every(r => r.sentiment === 'negative')).toBe(true)
  })

  it('filters to verified only', () => {
    const { result } = renderHook(() => useReviews(1, 'verified'))
    const reviews = result.current.data!
    expect(reviews.every(r => r.verified === true)).toBe(true)
  })
})

describe('useSearch', () => {
  it('returns empty array for empty query', () => {
    const { result } = renderHook(() => useSearch(''))
    expect(result.current.data).toEqual([])
  })

  it('returns matching products for a query', () => {
    const { result } = renderHook(() => useSearch('iphone'))
    expect(result.current.data!.length).toBeGreaterThan(0)
    expect(result.current.data![0].name).toMatch(/iPhone/i)
  })

  it('returns empty for no-match query', () => {
    const { result } = renderHook(() => useSearch('xyznotaproduct123'))
    expect(result.current.data).toEqual([])
  })
})

describe('useCategories', () => {
  it('returns category list', () => {
    const { result } = renderHook(() => useCategories())
    expect(result.current.data!.length).toBeGreaterThan(0)
    expect(result.current.data![0]).toHaveProperty('name')
    expect(result.current.data![0]).toHaveProperty('icon')
  })
})
