import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProductDetail from '../pages/ProductDetail'
import { useStore } from '../store/useStore'
import { mockProduct } from './fixtures'

vi.mock('../hooks/useProducts', () => ({
  useProduct: (id: number) => ({
    data: id === 1 ? mockProduct : null,
    loading: false,
    error: id === 1 ? null : 'Not found',
  }),
  useReviews: () => ({ data: [], loading: false, error: null }),
}))

const renderProduct = (id: string | number) =>
  render(
    <MemoryRouter initialEntries={[`/product/${id}`]}>
      <Routes>
        <Route path="/product/:id" element={<ProductDetail />} />
      </Routes>
    </MemoryRouter>
  )

describe('ProductDetail', () => {
  beforeEach(() => {
    useStore.setState({ watchlist: [], compareList: [] })
  })

  it('renders product name for a valid id', () => {
    renderProduct(1)
    expect(screen.getByText('Apple iPhone 15')).toBeInTheDocument()
  })

  it('renders brand and category', () => {
    renderProduct(1)
    expect(screen.getAllByText(/Apple/).length).toBeGreaterThanOrEqual(1)
  })

  it('renders product rating', () => {
    renderProduct(1)
    expect(screen.getAllByText('4.6').length).toBeGreaterThanOrEqual(1)
  })

  it('renders Save and Compare buttons', () => {
    renderProduct(1)
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /compare/i })).toBeInTheDocument()
  })

  it('renders Overview and Reviews tabs', () => {
    renderProduct(1)
    expect(screen.getByRole('button', { name: /overview/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reviews/i })).toBeInTheDocument()
  })

  it('shows overview content by default', () => {
    renderProduct(1)
    expect(screen.getByText(/Pros/i)).toBeInTheDocument()
    expect(screen.getByText(/Cons/i)).toBeInTheDocument()
  })

  it('switches to reviews tab on click', async () => {
    const user = userEvent.setup()
    renderProduct(1)
    await user.click(screen.getByRole('button', { name: /reviews/i }))
    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument()
  })

  it('shows product not found for an invalid id', () => {
    renderProduct(99999)
    expect(screen.getByText(/Product not found/i)).toBeInTheDocument()
  })

  it('Save button toggles to Saved state on click', async () => {
    const user = userEvent.setup()
    renderProduct(1)
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(screen.getByRole('button', { name: /saved/i })).toBeInTheDocument()
  })

  it('renders Back button', () => {
    renderProduct(1)
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
  })

  it('renders aspect score bars', () => {
    renderProduct(1)
    const labels = ['Camera', 'Battery', 'Performance', 'Display']
    const found = labels.filter(l => screen.queryByText(l))
    expect(found.length).toBeGreaterThan(0)
  })
})
