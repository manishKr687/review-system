import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AdminDashboard from '../pages/admin/AdminDashboard'

const mockStats = {
  total_products: 100,
  total_reviews: 5000,
  sentiment_breakdown: { positive: 2795, neutral: 1579, negative: 626 },
  categories: { Phones: 18, Laptops: 18, Headphones: 16 },
}

function renderDashboard() {
  localStorage.setItem('rl_admin_key', 'reviewlens-admin')
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/login" element={<div>Login</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('AdminDashboard', () => {

  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockStats), { status: 200 })
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('renders Dashboard heading', async () => {
    renderDashboard()
    await waitFor(() => expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument())
  })

  it('displays total products count', async () => {
    renderDashboard()
    await waitFor(() => expect(screen.getByText('100')).toBeInTheDocument())
  })

  it('displays total reviews count', async () => {
    renderDashboard()
    await waitFor(() => expect(screen.getByText('5,000')).toBeInTheDocument())
  })

  it('displays positive sentiment percentage', async () => {
    renderDashboard()
    // 2795/5000 = 55.9% → rounds to 56%
    await waitFor(() => expect(screen.getByText('56%')).toBeInTheDocument())
  })

  it('shows sentiment labels', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('positive')).toBeInTheDocument()
      expect(screen.getByText('neutral')).toBeInTheDocument()
      expect(screen.getByText('negative')).toBeInTheDocument()
    })
  })

  it('shows category names', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Phones')).toBeInTheDocument()
      expect(screen.getByText('Laptops')).toBeInTheDocument()
    })
  })

  it('renders Run NLP Analysis button', async () => {
    renderDashboard()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /run nlp analysis/i })).toBeInTheDocument()
    )
  })

  it('shows running state while analysis is in progress', async () => {
    const user = userEvent.setup()
    // First call: stats. Subsequent calls: analyse/run → status
    vi.spyOn(global, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify(mockStats), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ task_id: 'task-1', status: 'queued' }), { status: 200 }))
      .mockResolvedValue(new Response(JSON.stringify({ status: 'running', progress: { done: 100, total: 5000 } }), { status: 200 }))

    renderDashboard()
    await waitFor(() => screen.getByRole('button', { name: /run nlp analysis/i }))
    await user.click(screen.getByRole('button', { name: /run nlp analysis/i }))
    await waitFor(() => expect(screen.getByText(/running nlp/i)).toBeInTheDocument())
  })

  it('redirects to login on 401', async () => {
    vi.restoreAllMocks()
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ detail: 'Unauthorized' }), { status: 401 })
    )
    renderDashboard()
    await waitFor(() => expect(screen.getByText('Login')).toBeInTheDocument())
  })

})
