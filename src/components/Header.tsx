import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, PenLine, Bell, ChevronDown, Menu } from 'lucide-react';
import WriteReviewModal from './WriteReviewModal';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleSearch = () => {
    const q = query.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <>
    <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center gap-3 md:gap-4 flex-shrink-0 z-10">

      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors flex-shrink-0"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search input */}
      <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 md:px-4 py-2.5 gap-3 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-50 transition-all min-w-0">
        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Search products or features…'
          className="bg-transparent flex-1 text-sm outline-none text-gray-700 placeholder-gray-400 min-w-0"
        />
      </div>

      {/* Search button */}
      <button
        onClick={handleSearch}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 md:px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex-shrink-0"
      >
        <span className="hidden sm:inline">Search</span>
        <Search className="w-4 h-4 sm:hidden" />
      </button>

      <div className="hidden md:block w-px h-6 bg-gray-200" />

      {/* Write a Review — hidden on small screens */}
      <button
        onClick={() => setShowModal(true)}
        className="hidden md:flex items-center gap-2 text-sm text-gray-600 font-medium hover:text-indigo-600 transition-colors flex-shrink-0 whitespace-nowrap"
      >
        <PenLine className="w-4 h-4" />
        Write a Review
      </button>

      {/* Notification bell */}
      <button className="relative flex-shrink-0">
        <Bell className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors" />
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
          3
        </span>
      </button>

      {/* User avatar */}
      <button className="flex items-center gap-2 flex-shrink-0 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
          R
        </div>
        <span className="hidden sm:block text-sm font-medium text-gray-700">Rahul</span>
        <ChevronDown className="hidden sm:block w-4 h-4 text-gray-400" />
      </button>

    </header>

    {showModal && <WriteReviewModal onClose={() => setShowModal(false)} />}
  </>
  );
}
