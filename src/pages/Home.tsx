import HeroSection from '../components/HeroSection';
import CategoryPills from '../components/CategoryPills';
import TopReviewedProducts from '../components/TopReviewedProducts';
import BestForSection from '../components/BestForSection';
import ReviewInsights from '../components/ReviewInsights';
import ReviewSummaryPanel from '../components/ReviewSummaryPanel';

export default function Home() {
  return (
    <div className="flex h-full overflow-hidden">
      {/* Main scrollable content */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <HeroSection />
        <CategoryPills />
        <TopReviewedProducts />
        <BestForSection />
        <ReviewInsights />
      </main>

      {/* Fixed right panel — only on home page, hidden on small screens */}
      <div className="hidden xl:block">
        <ReviewSummaryPanel />
      </div>
    </div>
  );
}
