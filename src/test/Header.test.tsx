import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Header from '../components/Header'

// Header uses useNavigate so it must be rendered inside a Router
const renderHeader = () => render(<MemoryRouter><Header /></MemoryRouter>)

describe('Header', () => {

  it('renders the search input', () => {
    renderHeader()
    expect(screen.getByPlaceholderText(/Search products/i)).toBeInTheDocument()
  })

  it('renders the Search button', () => {
    renderHeader()
    expect(screen.getByRole('button', { name: /^search$/i })).toBeInTheDocument()
  })

  it('renders Write a Review button', () => {
    renderHeader()
    expect(screen.getByText(/Write a Review/i)).toBeInTheDocument()
  })

  it('renders user name', () => {
    renderHeader()
    expect(screen.getByText('Rahul')).toBeInTheDocument()
  })

  it('renders notification badge with count 3', () => {
    renderHeader()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('allows typing in the search input', async () => {
    const user = userEvent.setup()
    renderHeader()
    const input = screen.getByPlaceholderText(/Search products/i)
    await user.type(input, 'best phone')
    expect(input).toHaveValue('best phone')
  })

})
