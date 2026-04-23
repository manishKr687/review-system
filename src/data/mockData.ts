// ─── Types ────────────────────────────────────────────────────────────────────

export interface AspectScores {
  camera: number;
  battery: number;
  performance: number;
  display: number;
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

// ─── Categories ───────────────────────────────────────────────────────────────

export const categories: Category[] = [
  { name: 'Smartphones', reviewCount: 12430, icon: '📱', color: 'bg-blue-50' },
  { name: 'Laptops',     reviewCount: 8910,  icon: '💻', color: 'bg-purple-50' },
  { name: 'Headphones',  reviewCount: 6210,  icon: '🎧', color: 'bg-pink-50' },
  { name: 'Smartwatches',reviewCount: 4230,  icon: '⌚', color: 'bg-amber-50' },
  { name: 'Cameras',     reviewCount: 3540,  icon: '📷', color: 'bg-green-50' },
];

// ─── Top Products ─────────────────────────────────────────────────────────────

export const topProducts: Product[] = [
  {
    id: 1,
    name: 'Apple iPhone 15',
    brand: 'Apple',
    category: 'Smartphones',
    priceRange: '₹79,999+',
    rating: 4.6,
    reviewCount: 12342,
    quote: 'Amazing camera quality and super fast performance.',
    aspects: { camera: 4.7, battery: 4.6, performance: 4.5, display: 4.4 },
    rank: 1,
    bgFrom: 'from-blue-100',
    bgTo: 'to-blue-200',
    phoneColor: '#1D4ED8',
  },
  {
    id: 2,
    name: 'OnePlus 12R',
    brand: 'OnePlus',
    category: 'Smartphones',
    priceRange: '₹39,999+',
    rating: 4.5,
    reviewCount: 8765,
    quote: 'Smooth performance, excellent battery life and great value.',
    aspects: { camera: 4.3, battery: 4.7, performance: 4.6, display: 4.4 },
    rank: 2,
    bgFrom: 'from-slate-100',
    bgTo: 'to-slate-200',
    phoneColor: '#334155',
  },
  {
    id: 3,
    name: 'Samsung Galaxy S24',
    brand: 'Samsung',
    category: 'Smartphones',
    priceRange: '₹74,999+',
    rating: 4.6,
    reviewCount: 9876,
    quote: 'Stunning display and very capable camera.',
    aspects: { camera: 4.6, battery: 4.4, performance: 4.7, display: 4.8 },
    rank: 3,
    bgFrom: 'from-violet-100',
    bgTo: 'to-violet-200',
    phoneColor: '#6D28D9',
  },
  {
    id: 4,
    name: 'Google Pixel 8',
    brand: 'Google',
    category: 'Smartphones',
    priceRange: '₹59,999+',
    rating: 4.4,
    reviewCount: 6543,
    quote: 'Best camera in this price range. Clean software experience.',
    aspects: { camera: 4.8, battery: 4.3, performance: 4.5, display: 4.3 },
    rank: 4,
    bgFrom: 'from-emerald-100',
    bgTo: 'to-emerald-200',
    phoneColor: '#065F46',
  },
];

// ─── Hero Product (featured on homepage) ─────────────────────────────────────

export const heroProduct = topProducts[0];

// ─── Right Panel Data ─────────────────────────────────────────────────────────

export const overallRating = 4.6;
export const totalReviewCount = 125430;

export const starDistribution: StarDistribution[] = [
  { star: 5, percent: 72 },
  { star: 4, percent: 20 },
  { star: 3, percent: 6 },
  { star: 2, percent: 1 },
  { star: 1, percent: 1 },
];

export const whatPeopleLove: WhatPeopleLove[] = [
  { label: 'Camera Quality' },
  { label: 'Battery Life' },
  { label: 'Performance' },
  { label: 'Display' },
];

export const recentlyAnalyzed: RecentProduct[] = [
  {
    id: 10,
    name: 'Sony WH-1000XM5',
    rating: 4.7,
    reviewCount: 2345,
    icon: '🎧',
    bgFrom: 'from-gray-100',
    bgTo: 'to-gray-200',
  },
  {
    id: 11,
    name: 'Dell XPS 13',
    rating: 4.4,
    reviewCount: 1876,
    icon: '💻',
    bgFrom: 'from-blue-50',
    bgTo: 'to-blue-100',
  },
  {
    id: 12,
    name: 'iPad Air (5th Gen)',
    rating: 4.5,
    reviewCount: 3210,
    icon: '📱',
    bgFrom: 'from-slate-100',
    bgTo: 'to-slate-200',
  },
];

// ─── Review Insights Stats ────────────────────────────────────────────────────

export const insightStats = [
  { value: '12,342', label: 'Total Reviews Analyzed', icon: '😊', color: 'text-blue-500' },
  { value: '97%',    label: 'Positive Sentiment',     icon: '😄', color: 'text-emerald-500' },
  { value: '24',     label: 'Products Compared',      icon: '📊', color: 'text-violet-500' },
  { value: '15+',    label: 'Aspects Analyzed',       icon: '🔍', color: 'text-amber-500' },
];
