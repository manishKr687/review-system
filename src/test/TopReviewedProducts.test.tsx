import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TopReviewedProducts from '../components/TopReviewedProducts'
import { topProducts } from '../data/mockData'

describe('TopReviewedProducts', () => {

  it('renders all 4 tabs', () => {
    render(<TopReviewedProducts />)
    expect(screen.getByText('Overall Best')).toBeInTheDocument()
    expect(screen.getByText('Best Value')).toBeInTheDocument()
    expect(screen.getByText('Top Rated')).toBeInTheDocument()
    expect(screen.getByText('Trending')).toBeInTheDocument()
  })

  it('has "Overall Best" active by default', () => {
    render(<TopReviewedProducts />)
    const activeTab = screen.getByText('Overall Best')
    expect(activeTab).toHaveClass('bg-indigo-600', 'text-white')
  })

  it('switches active tab when clicked', async () => {
    const user = userEvent.setup()
    render(<TopReviewedProducts />)

    const bestValueTab = screen.getByText('Best Value')
    await user.click(bestValueTab)

    expect(bestValueTab).toHaveClass('bg-indigo-600', 'text-white')
    expect(screen.getByText('Overall Best')).not.toHaveClass('bg-indigo-600')
  })

  it('renders all product names from mock data', () => {
    render(<TopReviewedProducts />)
    topProducts.forEach(product => {
      expect(screen.getByText(product.name)).toBeInTheDocument()
    })
  })

  it('renders the section heading', () => {
    render(<TopReviewedProducts />)
    expect(screen.getByText('Top Reviewed Products')).toBeInTheDocument()
  })

  it('renders the Filters button', () => {
    render(<TopReviewedProducts />)
    expect(screen.getByText('Filters')).toBeInTheDocument()
  })

})
