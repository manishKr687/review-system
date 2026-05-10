import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Bell, Menu, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { fetchMe } from '../api/auth';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const { user, isLoggedIn, setAuth, logout } = useAuthStore();
  const [query, setQuery] = useState('');

  // Rehydrate user from token on first load
  useEffect(() => {
    if (isLoggedIn && !user) {
      fetchMe().then(u => setAuth(u, localStorage.getItem('rl_token')!)).catch(logout);
    }
  }, []);

  const displayName = user?.display_name ?? 'Guest';
  const initials = displayName.split(' ').map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase();

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
          placeholder="Search products or features…"
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

      {/* Notification bell */}
      <button className="relative flex-shrink-0">
        <Bell className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors" />
      </button>

      {isLoggedIn ? (
        /* Logged-in: avatar + name → profile, logout button */
        <div className="flex items-center gap-1 flex-shrink-0">
          <Link
            to="/profile"
            className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
              {initials}
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700">{displayName}</span>
          </Link>
          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Guest: sign in / register links */
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            to="/login"
            className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors px-2 py-1.5"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="text-sm font-semibold bg-indigo-600 text-white rounded-lg px-3 py-1.5 hover:bg-indigo-700 transition-colors"
          >
            Register
          </Link>
        </div>
      )}

    </header>

  </>
  );
}
