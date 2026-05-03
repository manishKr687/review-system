// ─── Types ────────────────────────────────────────────────────────────────────

export interface AspectScores {
  camera: number;
  battery: number;
  performance: number;
  display: number;
  [key: string]: number;
}

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
  aspects: AspectScores;
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

export interface ProductSummary {
  productId: number;
  pros: string[];
  cons: string[];
  highlights: string[];
}

export interface Category {
  name: string;
  reviewCount: number;
  icon: string;
  color: string;
}

export interface RecentProduct {
  id: number;
  name: string;
  rating: number;
  reviewCount: number;
  icon: string;
  bgFrom: string;
  bgTo: string;
}

export interface StarDistribution {
  star: number;
  percent: number;
}

export interface WhatPeopleLove {
  label: string;
}
