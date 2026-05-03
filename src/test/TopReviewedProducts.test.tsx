import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import TopReviewedProducts from '../components/TopReviewedProducts'
import { mockProduct, mockProduct2 } from './fixtures'

vi.mock('../hooks/useProducts', () => ({
  useRecommendations: () => ({ data: [mockProduct, mockProduct2], loading: false, error: null }),
}))

const renderComp = () => render(<MemoryRouter><TopReviewedProducts /></MemoryRouter>)

describe('TopReviewedProducts', () => {
  it('renders all 4 tabs', () => {
    renderComp()
    expect(screen.getByText('Overall Best')).toBeInTheDocument()
    expect(screen.getByText('Best Value')).toBeInTheDocument()
    expect(screen.getByText('Top Rated')).toBeInTheDocument()
    expect(screen.getByText('Trending')).toBeInTheDocument()
  })

  it('has "Overall Best" active by default', () => {
    renderComp()
    expect(screen.getByText('Overall Best')).toHaveClass('bg-indigo-600', 'text-white')
  })

  it('switches active tab when clicked', async () => {
    const user = userEvent.setup()
    renderComp()
    const bestValueTab = screen.getByText('Best Value')
    await user.click(bestValueTab)
    expect(bestValueTab).toHaveClass('bg-indigo-600', 'text-white')
    expect(screen.getByText('Overall Best')).not.toHaveClass('bg-indigo-600')
  })

  it('renders product names', () => {
    renderComp()
    expect(screen.getByText(mockProduct.name)).toBeInTheDocument()
    expect(screen.getByText(mockProduct2.name)).toBeInTheDocument()
  })

  it('renders the section heading', () => {
    renderComp()
    expect(screen.getByText('Top Reviewed Products')).toBeInTheDocument()
  })

  it('renders the View all button', () => {
    renderComp()
    expect(screen.getByText('View all')).toBeInTheDocument()
  })
})
