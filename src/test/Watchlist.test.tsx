import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Watchlist from '../pages/Watchlist'
import { useStore } from '../store/useStore'

const renderComp = () => render(<MemoryRouter><Watchlist /></MemoryRouter>)

describe('Watchlist', () => {

  beforeEach(() => {
    useStore.setState({ watchlist: [] })
  })

  it('shows empty state when nothing is saved', () => {
    renderComp()
    expect(screen.getByText(/Your watchlist is empty/i)).toBeInTheDocument()
  })

  it('shows Browse Products button in empty state', () => {
    renderComp()
    expect(screen.getByRole('button', { name: /Browse Products/i })).toBeInTheDocument()
  })

  it('shows product when added to watchlist', () => {
    useStore.setState({ watchlist: [1] })
    renderComp()
    expect(screen.getByText('Apple iPhone 15')).toBeInTheDocument()
  })

  it('shows correct saved count', () => {
    useStore.setState({ watchlist: [1, 2] })
    renderComp()
    expect(screen.getByText(/2 saved products/i)).toBeInTheDocument()
  })

  it('renders page heading', () => {
    renderComp()
    expect(screen.getByText('My Watchlist')).toBeInTheDocument()
  })

})
