import StarRating from './StarRating';
import { heroProduct } from '../data/mockData';

const aspects = [
  { name: 'Camera',      score: heroProduct.aspects.camera },
  { name: 'Battery',     score: heroProduct.aspects.battery },
  { name: 'Performance', score: heroProduct.aspects.performance },
  { name: 'Display',     score: heroProduct.aspects.display },
];

// Simple inline SVG phone illustration — no external image URLs needed.
function PhoneIllustration({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 220" className="w-32 h-auto drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <rect x="8" y="4" width="104" height="212" rx="18" fill={color} />
      {/* Screen */}
      <rect x="14" y="22" width="92" height="168" rx="10" fill="white" opacity="0.15" />
      {/* Dynamic island */}
      <rect x="40" y="12" width="40" height="8" rx="4" fill="black" opacity="0.4" />
      {/* Side button */}
      <rect x="112" y="70" width="4" height="24" rx="2" fill={color} style={{ filter: 'brightness(0.75)' }} />
      {/* Volume buttons */}
      <rect x="4" y="60" width="4" height="16" rx="2" fill={color} style={{ filter: 'brightness(0.75)' }} />
      <rect x="4" y="82" width="4" height="20" rx="2" fill={color} style={{ filter: 'brightness(0.75)' }} />
      {/* Camera cluster */}
      <rect x="20" y="32" width="48" height="48" rx="12" fill="black" opacity="0.25" />
      <circle cx="36" cy="48" r="10" fill="black" opacity="0.4" />
      <circle cx="36" cy="48" r="6" fill="black" opacity="0.5" />
      <circle cx="36" cy="48" r="3" fill={color} opacity="0.8" />
      <circle cx="56" cy="48" r="10" fill="black" opacity="0.4" />
      <circle cx="56" cy="48" r="6" fill="black" opacity="0.5" />
      <circle cx="56" cy="48" r="3" fill={color} opacity="0.8" />
      <circle cx="46" cy="64" r="8" fill="black" opacity="0.35" />
      <circle cx="46" cy="64" r="4" fill="black" opacity="0.5" />
      {/* Home indicator */}
      <rect x="44" y="204" width="32" height="4" rx="2" fill="white" opacity="0.3" />
    </svg>
  );
}

export default function HeroSection() {
  return (
    <div className="bg-white rounded-2xl px-8 py-6 flex items-center gap-8 shadow-sm border border-gray-100">

      {/* Left — Headline */}
      <div className="flex-1 min-w-0">
        <h2 className="text-2xl font-bold text-gray-900 leading-snug">
          Find the best products<br />
          <span className="text-indigo-600">based on real reviews</span>
        </h2>
        <p className="text-sm text-gray-400 mt-2 leading-relaxed">
          AI analyzes thousands of reviews to help<br />you choose with confidence.
        </p>
      </div>

      {/* Center — Product image */}
      <div className="flex-shrink-0 flex items-center justify-center w-36">
        <PhoneIllustration color={heroProduct.phoneColor} />
      </div>

      {/* Right — Rating breakdown */}
      <div className="flex-shrink-0 min-w-[200px]">
        <p className="text-xs text-gray-400 font-medium mb-1">Overall Rating</p>
        <div className="flex items-end gap-2 mb-1">
          <span className="text-4xl font-extrabold text-gray-900 leading-none">
            {heroProduct.rating}
          </span>
          <div className="pb-1">
            <StarRating rating={heroProduct.rating} size="lg" />
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          from {heroProduct.reviewCount.toLocaleString()} reviews
        </p>

        {/* Aspect bars */}
        <div className="space-y-2">
          {aspects.map(({ name, score }) => (
            <div key={name} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-24 flex-shrink-0">{name}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                <div
                  className="bg-emerald-500 rounded-full h-1.5 transition-all"
                  style={{ width: `${(score / 5) * 100}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-emerald-600 w-6 text-right">
                {score}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
