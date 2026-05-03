// ─── Types ────────────────────────────────────────────────────────────────────

export interface RecommendationScores {
  composite: number;
  sentiment: number;
  credibility: number;
  recency: number;
  value: number;
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  priceRange: string;
  rating: number;
  reviewCount: number;
  quote: string;
  aspects: { [key: string]: number };
  rank: number;
  bgFrom: string;
  bgTo: string;
  phoneColor: string;
  icon: string;
  scores?: RecommendationScores;
}

export interface Review {
  id: number;
  productId: number;
  author: string;
  initials: string;
  rating: number;
  text: string;
  date: string;
  verified: boolean;
  helpfulVotes: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  isSuspicious?: boolean;
}
