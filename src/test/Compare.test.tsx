import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Compare from '../pages/Compare'
import { useStore } from '../store/useStore'

const renderComp = () => render(<MemoryRouter><Compare /></MemoryRouter>)

describe('Compare', () => {

  beforeEach(() => {
    // Reset Zustand store before each test
    useStore.setState({ compareList: [] })
  })

  it('shows empty state when no products selected', () => {
    renderComp()
    expect(screen.getByText(/No products to compare/i)).toBeInTheDocument()
  })

  it('renders Browse Products button in empty state', () => {
    renderComp()
    expect(screen.getByRole('button', { name: /Browse Products/i })).toBeInTheDocument()
  })

  it('shows a product when added to compare list', () => {
    useStore.setState({ compareList: [1] })
    renderComp()
    expect(screen.getByText('Apple iPhone 15')).toBeInTheDocument()
  })

  it('shows the comparison table when products added', () => {
    useStore.setState({ compareList: [1, 2] })
    renderComp()
    expect(screen.getByText('Overall Rating')).toBeInTheDocument()
    expect(screen.getByText('Camera')).toBeInTheDocument()
  })

  it('shows Clear All button when products are added', () => {
    useStore.setState({ compareList: [1] })
    renderComp()
    expect(screen.getByText('Clear All')).toBeInTheDocument()
  })

})
