import StarRating from './StarRating';
import { useFeaturedProduct } from '../hooks/useProducts';

const ASPECT_LABELS = ['Camera', 'Battery', 'Performance', 'Display'];
const ASPECT_KEYS   = ['camera', 'battery', 'performance', 'display'];

function PhoneIllustration({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 220" className="w-32 h-auto drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="4" width="104" height="212" rx="18" fill={color} />
      <rect x="14" y="22" width="92" height="168" rx="10" fill="white" opacity="0.15" />
      <rect x="40" y="12" width="40" height="8" rx="4" fill="black" opacity="0.4" />
      <rect x="112" y="70" width="4" height="24" rx="2" fill={color} style={{ filter: 'brightness(0.75)' }} />
      <rect x="4" y="60" width="4" height="16" rx="2" fill={color} style={{ filter: 'brightness(0.75)' }} />
      <rect x="4" y="82" width="4" height="20" rx="2" fill={color} style={{ filter: 'brightness(0.75)' }} />
      <rect x="20" y="32" width="48" height="48" rx="12" fill="black" opacity="0.25" />
      <circle cx="36" cy="48" r="10" fill="black" opacity="0.4" />
      <circle cx="36" cy="48" r="6" fill="black" opacity="0.5" />
      <circle cx="36" cy="48" r="3" fill={color} opacity="0.8" />
      <circle cx="56" cy="48" r="10" fill="black" opacity="0.4" />
      <circle cx="56" cy="48" r="6" fill="black" opacity="0.5" />
      <circle cx="56" cy="48" r="3" fill={color} opacity="0.8" />
      <circle cx="46" cy="64" r="8" fill="black" opacity="0.35" />
      <circle cx="46" cy="64" r="4" fill="black" opacity="0.5" />
      <rect x="44" y="204" width="32" height="4" rx="2" fill="white" opacity="0.3" />
    </svg>
  );
}

export default function HeroSection() {
  const { data: product, loading } = useFeaturedProduct();

  if (loading || !product) {
    return (
      <div className="bg-white rounded-2xl px-5 md:px-8 py-6 shadow-sm border border-gray-100 h-40 animate-pulse" />
    );
  }

  return (
    <div className="bg-white rounded-2xl px-5 md:px-8 py-6 flex flex-col sm:flex-row items-center gap-6 md:gap-8 shadow-sm border border-gray-100">

      {/* Left — Headline */}
      <div className="flex-1 min-w-0 text-center sm:text-left">
        <h2 className="text-2xl font-bold text-gray-900 leading-snug">
          Find the best products<br />
          <span className="text-indigo-600">based on real reviews</span>
        </h2>
        <p className="text-sm text-gray-400 mt-2 leading-relaxed">
          AI analyzes thousands of reviews to help<br />you choose with confidence.
        </p>
      </div>

      {/* Center — Product image */}
      <div className="hidden sm:flex flex-shrink-0 items-center justify-center w-36">
        <PhoneIllustration color={product.phoneColor} />
      </div>

      {/* Right — Rating breakdown */}
      <div className="flex-shrink-0 w-full sm:w-auto sm:min-w-[200px]">
        <p className="text-xs text-gray-400 font-medium mb-1">
          {product.name}
        </p>
        <div className="flex items-end gap-2 mb-1">
          <span className="text-4xl font-extrabold text-gray-900 leading-none">
            {product.rating}
          </span>
          <div className="pb-1">
            <StarRating rating={product.rating} size="lg" />
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          from {product.reviewCount.toLocaleString()} reviews
        </p>

        <div className="space-y-2">
          {ASPECT_KEYS.map((key, i) => {
            const score = (product.aspects as Record<string, number>)[key] ?? 0;
            if (!score) return null;
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-24 flex-shrink-0">{ASPECT_LABELS[i]}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                  <div className="bg-emerald-500 rounded-full h-1.5" style={{ width: `${(score / 5) * 100}%` }} />
                </div>
                <span className="text-xs font-semibold text-emerald-600 w-6 text-right">{score}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
