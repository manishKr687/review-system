import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import HeroSection from '../components/HeroSection'
import { mockProduct } from './fixtures'

vi.mock('../hooks/useProducts', () => ({
  useFeaturedProduct: () => ({ data: mockProduct, loading: false, error: null }),
  useStats: () => ({
    data: {
      total_reviews: 12342,
      total_products: 65,
      avg_rating: 4.6,
      positive_pct: 72,
      star_distribution: [],
    },
    loading: false,
    error: null,
  }),
}))

const renderComp = () => render(<MemoryRouter><HeroSection /></MemoryRouter>)

describe('HeroSection', () => {
  it('renders the main headline', () => {
    renderComp()
    expect(screen.getByText(/Find the best products/i)).toBeInTheDocument()
  })

  it('renders the featured product name', () => {
    renderComp()
    expect(screen.getByText(mockProduct.name)).toBeInTheDocument()
  })

  it('renders all 4 aspect labels', () => {
    renderComp()
    expect(screen.getByText('Camera')).toBeInTheDocument()
    expect(screen.getByText('Battery')).toBeInTheDocument()
    expect(screen.getByText('Performance')).toBeInTheDocument()
    expect(screen.getByText('Display')).toBeInTheDocument()
  })

  it('renders aspect score values', () => {
    renderComp()
    expect(screen.getByText(String(mockProduct.aspects.camera))).toBeInTheDocument()
    expect(screen.getByText(String(mockProduct.aspects.performance))).toBeInTheDocument()
  })

  it('renders the overall rating', () => {
    renderComp()
    expect(screen.getAllByText(String(mockProduct.rating)).length).toBeGreaterThanOrEqual(1)
  })
})
