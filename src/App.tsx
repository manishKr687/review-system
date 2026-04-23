import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import CategoryPills from './components/CategoryPills';
import TopReviewedProducts from './components/TopReviewedProducts';
import ReviewInsights from './components/ReviewInsights';
import ReviewSummaryPanel from './components/ReviewSummaryPanel';

export default function App() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* Column 1 — Fixed left sidebar */}
      <Sidebar />

      {/* Columns 2 + 3 — Header + content area */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Top bar */}
        <Header />

        {/* Content row */}
        <div className="flex flex-1 overflow-hidden">

          {/* Column 2 — Scrollable main content */}
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            <HeroSection />
            <CategoryPills />
            <TopReviewedProducts />
            <ReviewInsights />
          </main>

          {/* Column 3 — Fixed right panel */}
          <ReviewSummaryPanel />

        </div>
      </div>

    </div>
  );
}
