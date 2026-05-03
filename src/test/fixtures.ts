import type { Product, Review } from '../data/mockData'
import type { ProductWithSummary } from '../hooks/useProducts'
import type { ApiProduct, ApiReview, Category } from '../api/types'

// ── Shared mock product (frontend shape) ─────────────────────────────────────

export const mockProduct: ProductWithSummary = {
  id: 1,
  name: 'Apple iPhone 15',
  brand: 'Apple',
  category: 'Phones',
  priceRange: '$999',
  rating: 4.6,
  reviewCount: 1200,
  quote: 'The benchmark for smartphones.',
  aspects: { camera: 4.8, battery: 4.4, performance: 4.7, display: 4.6 },
  rank: 1,
  bgFrom: 'from-blue-100',
  bgTo: 'to-blue-200',
  phoneColor: '#1D4ED8',
  icon: '📱',
  pros: ['Excellent camera', 'Smooth performance'],
  cons: ['Expensive', 'No charger in box'],
  highlights: ['A17 Pro chip', 'Titanium frame'],
}

export const mockProduct2: Product = {
  id: 2,
  name: 'Samsung Galaxy S24 Ultra',
  brand: 'Samsung',
  category: 'Phones',
  priceRange: '$1299',
  rating: 4.7,
  reviewCount: 980,
  quote: 'Power user\'s choice.',
  aspects: { camera: 4.9, battery: 4.6, performance: 4.8, display: 4.9 },
  rank: 2,
  bgFrom: 'from-gray-100',
  bgTo: 'to-gray-200',
  phoneColor: '#374151',
  icon: '📱',
}

// ── Shared mock review ────────────────────────────────────────────────────────

export const mockReview: Review = {
  id: 1,
  productId: 1,
  author: 'Alice',
  initials: 'AL',
  rating: 5,
  text: 'Amazing phone, love the camera.',
  date: '2026-01-15',
  verified: true,
  helpfulVotes: 12,
  sentiment: 'positive',
}

// ── Shared mock API shapes ────────────────────────────────────────────────────

export const mockApiProduct: ApiProduct = {
  id: 1,
  name: 'Apple iPhone 15',
  brand: 'Apple',
  category: 'Phones',
  price: 999,
  rating: 4.6,
  review_count: 1200,
  icon: '📱',
  quote: 'The benchmark for smartphones.',
  aspects: { camera: 4.8, battery: 4.4, performance: 4.7, display: 4.6, audio: 0, build: 4.5, value: 4.3 },
  scores: null,
  pros: ['Excellent camera'],
  cons: ['Expensive'],
  highlights: ['A17 Pro chip'],
}

export const mockApiReview: ApiReview = {
  id: 1,
  product_id: 1,
  author: 'Alice',
  rating: 5,
  title: 'Great phone',
  body: 'Amazing phone, love the camera.',
  sentiment: 'positive',
  verified: true,
  helpful: 12,
  date: '2026-01-15',
  is_suspicious: false,
}

export const mockCategories: Category[] = [
  { name: 'Phones',       icon: '📱' },
  { name: 'Laptops',      icon: '💻' },
  { name: 'Headphones',   icon: '🎧' },
  { name: 'Smartwatches', icon: '⌚' },
]
