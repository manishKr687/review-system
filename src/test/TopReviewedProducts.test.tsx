import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import TopReviewedProducts from '../components/TopReviewedProducts'
import { topProducts } from '../data/mockData'

// TopReviewedProducts → ProductCard → useNavigate, so needs Router
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

  it('renders all product names from mock data', () => {
    renderComp()
    topProducts.forEach(product => {
      expect(screen.getByText(product.name)).toBeInTheDocument()
    })
  })

  it('renders the section heading', () => {
    renderComp()
    expect(screen.getByText('Top Reviewed Products')).toBeInTheDocument()
  })

  it('renders the Filters button', () => {
    renderComp()
    expect(screen.getByText('Filters')).toBeInTheDocument()
  })

})
