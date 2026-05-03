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

// ─── Categories ───────────────────────────────────────────────────────────────

export const categories: Category[] = [
  { name: 'Smartphones',  reviewCount: 12430, icon: '📱', color: 'bg-blue-50' },
  { name: 'Laptops',      reviewCount: 8910,  icon: '💻', color: 'bg-purple-50' },
  { name: 'Headphones',   reviewCount: 6210,  icon: '🎧', color: 'bg-pink-50' },
  { name: 'Smartwatches', reviewCount: 4230,  icon: '⌚', color: 'bg-amber-50' },
  { name: 'Cameras',      reviewCount: 3540,  icon: '📷', color: 'bg-green-50' },
];

// ─── Smartphones ──────────────────────────────────────────────────────────────

export const topProducts: Product[] = [
  {
    id: 1, name: 'Apple iPhone 15', brand: 'Apple', category: 'Smartphones',
    priceRange: '₹79,999+', rating: 4.6, reviewCount: 12342, rank: 1, icon: '📱',
    quote: 'Amazing camera quality and super fast performance.',
    aspects: { camera: 4.7, battery: 4.6, performance: 4.5, display: 4.4 },
    bgFrom: 'from-blue-100', bgTo: 'to-blue-200', phoneColor: '#1D4ED8',
  },
  {
    id: 2, name: 'OnePlus 12R', brand: 'OnePlus', category: 'Smartphones',
    priceRange: '₹39,999+', rating: 4.5, reviewCount: 8765, rank: 2, icon: '📱',
    quote: 'Smooth performance, excellent battery life and great value.',
    aspects: { camera: 4.3, battery: 4.7, performance: 4.6, display: 4.4 },
    bgFrom: 'from-slate-100', bgTo: 'to-slate-200', phoneColor: '#334155',
  },
  {
    id: 3, name: 'Samsung Galaxy S24', brand: 'Samsung', category: 'Smartphones',
    priceRange: '₹74,999+', rating: 4.6, reviewCount: 9876, rank: 3, icon: '📱',
    quote: 'Stunning display and very capable camera.',
    aspects: { camera: 4.6, battery: 4.4, performance: 4.7, display: 4.8 },
    bgFrom: 'from-violet-100', bgTo: 'to-violet-200', phoneColor: '#6D28D9',
  },
  {
    id: 4, name: 'Google Pixel 8', brand: 'Google', category: 'Smartphones',
    priceRange: '₹59,999+', rating: 4.4, reviewCount: 6543, rank: 4, icon: '📱',
    quote: 'Best camera in this price range. Clean software experience.',
    aspects: { camera: 4.8, battery: 4.3, performance: 4.5, display: 4.3 },
    bgFrom: 'from-emerald-100', bgTo: 'to-emerald-200', phoneColor: '#065F46',
  },
];

// ─── Laptops ──────────────────────────────────────────────────────────────────

const laptopProducts: Product[] = [
  {
    id: 5, name: 'MacBook Air M2', brand: 'Apple', category: 'Laptops',
    priceRange: '₹1,14,900+', rating: 4.8, reviewCount: 9210, rank: 1, icon: '💻',
    quote: 'Incredible battery life with completely silent performance.',
    aspects: { camera: 3.8, battery: 4.9, performance: 4.9, display: 4.7 },
    bgFrom: 'from-gray-100', bgTo: 'to-gray-200', phoneColor: '#6B7280',
  },
  {
    id: 6, name: 'Dell XPS 15', brand: 'Dell', category: 'Laptops',
    priceRange: '₹1,39,990+', rating: 4.5, reviewCount: 5430, rank: 2, icon: '💻',
    quote: 'Best Windows laptop for creatives with a gorgeous OLED display.',
    aspects: { camera: 3.5, battery: 4.2, performance: 4.7, display: 4.9 },
    bgFrom: 'from-blue-100', bgTo: 'to-blue-200', phoneColor: '#1E40AF',
  },
  {
    id: 7, name: 'Lenovo ThinkPad X1 Carbon', brand: 'Lenovo', category: 'Laptops',
    priceRange: '₹1,29,000+', rating: 4.4, reviewCount: 3870, rank: 3, icon: '💻',
    quote: 'The gold standard for business laptops. Ultra-light and durable.',
    aspects: { camera: 3.6, battery: 4.5, performance: 4.5, display: 4.4 },
    bgFrom: 'from-red-100', bgTo: 'to-red-200', phoneColor: '#991B1B',
  },
];

// ─── Headphones ───────────────────────────────────────────────────────────────

const headphoneProducts: Product[] = [
  {
    id: 8, name: 'Sony WH-1000XM5', brand: 'Sony', category: 'Headphones',
    priceRange: '₹24,990+', rating: 4.7, reviewCount: 8920, rank: 1, icon: '🎧',
    quote: 'Industry-leading noise cancellation. Perfect for travel.',
    aspects: { camera: 0, battery: 4.8, performance: 4.7, display: 0 },
    bgFrom: 'from-gray-100', bgTo: 'to-gray-200', phoneColor: '#1F2937',
  },
  {
    id: 9, name: 'Apple AirPods Pro 2', brand: 'Apple', category: 'Headphones',
    priceRange: '₹24,900+', rating: 4.6, reviewCount: 11340, rank: 2, icon: '🎧',
    quote: 'Seamless Apple ecosystem integration with great ANC.',
    aspects: { camera: 0, battery: 4.5, performance: 4.6, display: 0 },
    bgFrom: 'from-slate-100', bgTo: 'to-slate-200', phoneColor: '#64748B',
  },
  {
    id: 10, name: 'Bose QuietComfort 45', brand: 'Bose', category: 'Headphones',
    priceRange: '₹29,900+', rating: 4.5, reviewCount: 6210, rank: 3, icon: '🎧',
    quote: 'Supremely comfortable for all-day wear with excellent ANC.',
    aspects: { camera: 0, battery: 4.7, performance: 4.4, display: 0 },
    bgFrom: 'from-amber-100', bgTo: 'to-amber-200', phoneColor: '#92400E',
  },
];

// ─── Smartwatches ─────────────────────────────────────────────────────────────

const smartwatchProducts: Product[] = [
  {
    id: 11, name: 'Apple Watch Series 9', brand: 'Apple', category: 'Smartwatches',
    priceRange: '₹41,900+', rating: 4.7, reviewCount: 7650, rank: 1, icon: '⌚',
    quote: 'The most capable smartwatch with top-notch health tracking.',
    aspects: { camera: 0, battery: 4.1, performance: 4.8, display: 4.8 },
    bgFrom: 'from-pink-100', bgTo: 'to-pink-200', phoneColor: '#BE185D',
  },
  {
    id: 12, name: 'Samsung Galaxy Watch 6', brand: 'Samsung', category: 'Smartwatches',
    priceRange: '₹29,999+', rating: 4.4, reviewCount: 4230, rank: 2, icon: '⌚',
    quote: 'Best Android smartwatch with excellent health sensors.',
    aspects: { camera: 0, battery: 4.3, performance: 4.5, display: 4.6 },
    bgFrom: 'from-indigo-100', bgTo: 'to-indigo-200', phoneColor: '#3730A3',
  },
];

// ─── Cameras ──────────────────────────────────────────────────────────────────

const cameraProducts: Product[] = [
  {
    id: 13, name: 'Sony Alpha A7 IV', brand: 'Sony', category: 'Cameras',
    priceRange: '₹2,49,990+', rating: 4.8, reviewCount: 3540, rank: 1, icon: '📷',
    quote: 'A masterpiece for hybrid shooters with best-in-class autofocus.',
    aspects: { camera: 4.9, battery: 4.2, performance: 4.8, display: 4.5 },
    bgFrom: 'from-zinc-100', bgTo: 'to-zinc-200', phoneColor: '#3F3F46',
  },
  {
    id: 14, name: 'Canon EOS R6 Mark II', brand: 'Canon', category: 'Cameras',
    priceRange: '₹2,39,990+', rating: 4.7, reviewCount: 2890, rank: 2, icon: '📷',
    quote: 'Exceptional video capabilities with incredible image stabilisation.',
    aspects: { camera: 4.8, battery: 4.3, performance: 4.7, display: 4.4 },
    bgFrom: 'from-red-100', bgTo: 'to-red-200', phoneColor: '#B91C1C',
  },
];

// ─── All Products ─────────────────────────────────────────────────────────────

export const allProducts: Product[] = [
  ...topProducts,
  ...laptopProducts,
  ...headphoneProducts,
  ...smartwatchProducts,
  ...cameraProducts,
];

// ─── Reviews ─────────────────────────────────────────────────────────────────

export const reviews: Review[] = [
  // iPhone 15
  { id: 1,  productId: 1, author: 'Rahul Kumar',  initials: 'RK', rating: 5, verified: true,  helpfulVotes: 124, sentiment: 'positive', date: '2024-02-10', text: 'The iPhone 15 is an absolute beast. The camera system is mind-blowing — every shot comes out perfectly. Performance is top-tier and iOS is smoother than ever.' },
  { id: 2,  productId: 1, author: 'Priya Singh',  initials: 'PS', rating: 4, verified: true,  helpfulVotes: 87,  sentiment: 'positive', date: '2024-01-28', text: 'Great phone overall. Camera is excellent for photography enthusiasts. Battery lasts a full day easily. The only downside is the price — but you get what you pay for.' },
  { id: 3,  productId: 1, author: 'Amit Sharma',  initials: 'AS', rating: 5, verified: false, helpfulVotes: 63,  sentiment: 'positive', date: '2024-01-15', text: 'Dynamic Island is actually useful once you get used to it. USB-C is a welcome change. Highly recommend this over last year\'s model.' },
  { id: 4,  productId: 1, author: 'Neha Patel',   initials: 'NP', rating: 3, verified: true,  helpfulVotes: 45,  sentiment: 'neutral',  date: '2024-01-05', text: 'Good phone but nothing revolutionary over iPhone 14. Battery could be better. Camera is great though. Feel like I\'m paying a premium just for the Apple logo.' },
  { id: 5,  productId: 1, author: 'Vikram Das',   initials: 'VD', rating: 4, verified: true,  helpfulVotes: 38,  sentiment: 'positive', date: '2023-12-20', text: 'Switched from Android after 5 years. The transition was smooth and I love the build quality. Camera is leagues ahead of my old Samsung.' },
  // OnePlus 12R
  { id: 6,  productId: 2, author: 'Karan Mehta',  initials: 'KM', rating: 5, verified: true,  helpfulVotes: 96,  sentiment: 'positive', date: '2024-02-05', text: 'Best value flagship killer in 2024. The Snapdragon 8 Gen 2 handles everything effortlessly. Battery is a monster — 5000mAh with 100W charging.' },
  { id: 7,  productId: 2, author: 'Ananya Roy',   initials: 'AR', rating: 4, verified: true,  helpfulVotes: 72,  sentiment: 'positive', date: '2024-01-22', text: 'OxygenOS is clean and fast. Display is gorgeous at 120Hz. Camera is decent but not class-leading. Very happy for the price.' },
  { id: 8,  productId: 2, author: 'Suresh Iyer',  initials: 'SI', rating: 4, verified: false, helpfulVotes: 54,  sentiment: 'positive', date: '2024-01-10', text: 'Incredible performance for the price. Gaming is butter smooth. Slight heating under heavy load but nothing alarming. Great daily driver.' },
  { id: 9,  productId: 2, author: 'Divya Nair',   initials: 'DN', rating: 3, verified: true,  helpfulVotes: 31,  sentiment: 'neutral',  date: '2023-12-30', text: 'Good phone but I expected better camera. Low light photography is average. Battery and performance are excellent though.' },
  { id: 10, productId: 2, author: 'Rohan Gupta',  initials: 'RG', rating: 5, verified: true,  helpfulVotes: 28,  sentiment: 'positive', date: '2023-12-15', text: '100W charging is insane — full charge in 25 minutes! Performance rivals phones twice the price. OnePlus is back with this one.' },
  // Samsung Galaxy S24
  { id: 11, productId: 3, author: 'Meera Krishna', initials: 'MK', rating: 5, verified: true,  helpfulVotes: 108, sentiment: 'positive', date: '2024-02-08', text: 'Galaxy AI features are genuinely useful. The display is the best I\'ve seen on any phone. Camera versatility is unmatched with the zoom capabilities.' },
  { id: 12, productId: 3, author: 'Arjun Verma',  initials: 'AV', rating: 4, verified: true,  helpfulVotes: 79,  sentiment: 'positive', date: '2024-01-25', text: 'Titanium frame feels premium. The processor is noticeably faster than S23. Promised 7 years of updates makes this a long-term investment.' },
  { id: 13, productId: 3, author: 'Sonal Joshi',  initials: 'SJ', rating: 3, verified: true,  helpfulVotes: 52,  sentiment: 'neutral',  date: '2024-01-12', text: 'Great display but battery life is disappointing. I can barely get through a full day with moderate use. Also gets warm during gaming.' },
  { id: 14, productId: 3, author: 'Nitin Agarwal', initials: 'NA', rating: 5, verified: false, helpfulVotes: 41,  sentiment: 'positive', date: '2023-12-28', text: 'One UI 6 is the best Android skin. The camera system is versatile — from macro to 30x zoom. Best Android phone you can buy right now.' },
  { id: 15, productId: 3, author: 'Kavita Reddy', initials: 'KR', rating: 4, verified: true,  helpfulVotes: 35,  sentiment: 'positive', date: '2023-12-18', text: 'Circle to Search is my favourite new feature. The 50MP main camera produces stunning shots. Slightly pricey but worth it for the display alone.' },
  // Google Pixel 8
  { id: 16, productId: 4, author: 'Tushar Bose',  initials: 'TB', rating: 5, verified: true,  helpfulVotes: 93,  sentiment: 'positive', date: '2024-02-02', text: 'Pixel 8 has the most natural-looking photos of any phone. Magic Eraser and Best Take are game-changers. Pure Android experience is refreshing.' },
  { id: 17, productId: 4, author: 'Shreya Kapoor', initials: 'SK', rating: 4, verified: true,  helpfulVotes: 68,  sentiment: 'positive', date: '2024-01-20', text: 'Tensor G3 chip is much improved. Night Sight photos are stunning. 7 years of updates is a huge selling point. Great for the long haul.' },
  { id: 18, productId: 4, author: 'Deepak Mishra', initials: 'DM', rating: 4, verified: true,  helpfulVotes: 47,  sentiment: 'positive', date: '2024-01-08', text: 'Camera computational photography is unmatched. Software experience is incredibly smooth. Battery is acceptable but not class-leading.' },
  { id: 19, productId: 4, author: 'Pooja Rao',    initials: 'PR', rating: 2, verified: false, helpfulVotes: 29,  sentiment: 'negative', date: '2023-12-25', text: 'Had overheating issues during the first few weeks. Google sorted it out with an update but it was frustrating. Camera is great when it works.' },
  { id: 20, productId: 4, author: 'Manish Tiwari', initials: 'MT', rating: 5, verified: true,  helpfulVotes: 22,  sentiment: 'positive', date: '2023-12-10', text: 'Best camera phone under ₹60k. The AI photo editing features alone are worth the price. Clean software, fast updates, excellent value.' },
];

// ─── Product Summaries ────────────────────────────────────────────────────────

export const productSummaries: ProductSummary[] = [
  {
    productId: 1,
    pros: ['Industry-leading camera system', 'Lightning-fast A16 Bionic chip', 'USB-C port finally arrived', 'Premium titanium build quality', 'Excellent long-term software support'],
    cons: ['Very expensive for the features offered', 'No charger included in the box', 'Battery life is only average', 'Minimal upgrade over iPhone 14'],
    highlights: ['Camera quality is unmatched in this price range', 'Dynamic Island is genuinely useful after getting used to it', 'iOS 17 makes the overall experience even better'],
  },
  {
    productId: 2,
    pros: ['Exceptional value for money', '100W fast charging (full in 25 min)', 'Flagship Snapdragon 8 Gen 2 chip', 'Large 5000mAh battery', 'Clean OxygenOS experience'],
    cons: ['Camera lags behind true flagships', 'Average low-light photography', 'No wireless charging support', 'Slight heating under gaming load'],
    highlights: ['100W charging is the fastest in its class at this price', 'Performance rivals phones at twice the price', 'OxygenOS remains the cleanest Android skin available'],
  },
  {
    productId: 3,
    pros: ['Best-in-class AMOLED display (2600 nits)', 'Galaxy AI features are genuinely useful', '7 years of OS updates promised', 'Versatile triple camera system', 'Premium titanium design language'],
    cons: ['Battery drains faster than competitors', 'Gets warm under heavy load', 'Very expensive', 'One UI can feel bloated with pre-installed apps'],
    highlights: ['The 2600-nit display is the brightest on any phone', 'Circle to Search is a genuine breakthrough feature', 'Snapdragon 8 Gen 3 makes it the fastest Android phone'],
  },
  {
    productId: 4,
    pros: ['Best computational photography available', 'Clean stock Android experience', '7 years of guaranteed OS updates', 'Magic Eraser and Best Take AI features', 'Excellent Night Sight low-light mode'],
    cons: ['Tensor G3 chip runs warm occasionally', 'Battery life is only average', 'Premium price for a mid-range build feel', 'Limited availability outside major cities'],
    highlights: ['Photos look the most natural of any phone camera', 'AI features like Magic Eraser genuinely save time', 'Pure Android with instant updates is a rare luxury'],
  },
];

// ─── Hero (homepage featured product) ────────────────────────────────────────

export const heroProduct = topProducts[0];

// ─── Right Panel Data ─────────────────────────────────────────────────────────

export const overallRating     = 4.6;
export const totalReviewCount  = 125430;

export const starDistribution: StarDistribution[] = [
  { star: 5, percent: 72 },
  { star: 4, percent: 20 },
  { star: 3, percent: 6  },
  { star: 2, percent: 1  },
  { star: 1, percent: 1  },
];

export const whatPeopleLove: WhatPeopleLove[] = [
  { label: 'Camera Quality' },
  { label: 'Battery Life'   },
  { label: 'Performance'    },
  { label: 'Display'        },
];

export const recentlyAnalyzed: RecentProduct[] = [
  { id: 8,  name: 'Sony WH-1000XM5',   rating: 4.7, reviewCount: 2345, icon: '🎧', bgFrom: 'from-gray-100',  bgTo: 'to-gray-200'  },
  { id: 6,  name: 'Dell XPS 15',        rating: 4.4, reviewCount: 1876, icon: '💻', bgFrom: 'from-blue-50',   bgTo: 'to-blue-100'  },
  { id: 11, name: 'Apple Watch S9',     rating: 4.5, reviewCount: 3210, icon: '⌚', bgFrom: 'from-slate-100', bgTo: 'to-slate-200' },
];

export const insightStats = [
  { value: '12,342', label: 'Total Reviews Analyzed', icon: '😊', color: 'text-blue-500'    },
  { value: '97%',    label: 'Positive Sentiment',     icon: '😄', color: 'text-emerald-500' },
  { value: '24',     label: 'Products Compared',      icon: '📊', color: 'text-violet-500'  },
  { value: '15+',    label: 'Aspects Analyzed',       icon: '🔍', color: 'text-amber-500'   },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────

export function getProductById(id: number): Product | undefined {
  return allProducts.find(p => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return allProducts.filter(p => p.category === category);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return allProducts.filter(p =>
    p.name.toLowerCase().includes(q)     ||
    p.brand.toLowerCase().includes(q)    ||
    p.category.toLowerCase().includes(q) ||
    p.quote.toLowerCase().includes(q)
  );
}

export function getReviewsByProductId(productId: number): Review[] {
  return reviews.filter(r => r.productId === productId);
}

export function getProductSummary(productId: number): ProductSummary | undefined {
  return productSummaries.find(s => s.productId === productId);
}
