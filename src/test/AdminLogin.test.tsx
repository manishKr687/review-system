import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AdminLogin from '../pages/admin/AdminLogin'

const mockStats = { total_products: 100, total_reviews: 5000, sentiment_breakdown: {}, categories: {} }

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/admin/login']}>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('AdminLogin', () => {

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('renders the sign in heading', () => {
    renderLogin()
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders the password input', () => {
    renderLogin()
    expect(screen.getByPlaceholderText(/••/)).toBeInTheDocument()
  })

  it('renders the sign in button', () => {
    renderLogin()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('sign in button is disabled when input is empty', () => {
    renderLogin()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled()
  })

  it('sign in button enables when key is typed', async () => {
    const user = userEvent.setup()
    renderLogin()
    await user.type(screen.getByPlaceholderText(/••/), 'reviewlens-admin')
    expect(screen.getByRole('button', { name: /sign in/i })).not.toBeDisabled()
  })

  it('shows error on 401 response', async () => {
    const user = userEvent.setup()
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ detail: 'Unauthorized' }), { status: 401 })
    )
    renderLogin()
    await user.type(screen.getByPlaceholderText(/••/), 'wrong-key')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => expect(screen.getByText(/incorrect admin key/i)).toBeInTheDocument())
  })

  it('shows network error when fetch fails', async () => {
    const user = userEvent.setup()
    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'))
    renderLogin()
    await user.type(screen.getByPlaceholderText(/••/), 'any-key')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => expect(screen.getByText(/could not reach/i)).toBeInTheDocument())
  })

  it('navigates to /admin on successful login', async () => {
    const user = userEvent.setup()
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockStats), { status: 200 })
    )
    renderLogin()
    await user.type(screen.getByPlaceholderText(/••/), 'reviewlens-admin')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => expect(screen.getByText('Dashboard')).toBeInTheDocument())
  })

  it('stores key in localStorage on success', async () => {
    const user = userEvent.setup()
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockStats), { status: 200 })
    )
    renderLogin()
    await user.type(screen.getByPlaceholderText(/••/), 'reviewlens-admin')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => expect(localStorage.getItem('rl_admin_key')).toBe('reviewlens-admin'))
  })

})
