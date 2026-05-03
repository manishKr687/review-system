import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import SearchResults from '../pages/SearchResults'
import { mockProduct } from './fixtures'

vi.mock('../hooks/useProducts', () => ({
  useSearch: (q: string) => {
    if (!q.trim()) return { data: [], loading: false, error: null }
    if (q === 'xyznotaproduct123') return { data: [], loading: false, error: null }
    return { data: [mockProduct], loading: false, error: null }
  },
}))

const renderWithQuery = (q = '') =>
  render(
    <MemoryRouter initialEntries={[`/search?q=${encodeURIComponent(q)}`]}>
      <Routes>
        <Route path="/search" element={<SearchResults />} />
      </Routes>
    </MemoryRouter>
  )

describe('SearchResults', () => {
  it('shows empty state when no query', () => {
    renderWithQuery('')
    expect(screen.getByText(/Search for products/i)).toBeInTheDocument()
  })

  it('returns results for a valid query', () => {
    renderWithQuery('iphone')
    expect(screen.getByText(/Apple iPhone 15/i)).toBeInTheDocument()
  })

  it('shows Best Match badge on first result', () => {
    renderWithQuery('phone')
    expect(screen.getAllByText(/Best Match/i).length).toBeGreaterThanOrEqual(1)
  })

  it('shows no results state for unknown query', () => {
    renderWithQuery('xyznotaproduct123')
    expect(screen.getByText(/No products found/i)).toBeInTheDocument()
  })

  it('renders the search input', () => {
    renderWithQuery('laptop')
    expect(screen.getByPlaceholderText(/Try "best laptop/i)).toBeInTheDocument()
  })

  it('shows result count', () => {
    renderWithQuery('sony')
    expect(screen.getByText(/products found/i)).toBeInTheDocument()
  })
})
