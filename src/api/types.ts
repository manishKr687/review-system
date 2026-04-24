export interface AspectScores {
  camera: number
  battery: number
  performance: number
  display: number
  audio: number
  build: number
  value: number
}

export interface ApiProduct {
  id: number
  name: string
  brand: string
  category: string
  price: number
  rating: number
  review_count: number
  icon: string
  quote: string
  aspects: AspectScores
  pros?: string[]
  cons?: string[]
  highlights?: string[]
}

export interface ApiReview {
  id: number
  product_id: number
  author: string
  rating: number
  title: string
  body: string
  sentiment: 'positive' | 'negative' | 'neutral'
  verified: boolean
  helpful: number
  date: string
}

export interface ProductsResponse {
  total: number
  products: ApiProduct[]
}

export interface ReviewsResponse {
  total: number
  reviews: ApiReview[]
}

export interface Category {
  name: string
  icon: string
}
