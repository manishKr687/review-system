import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import CategoryBrowse from './pages/CategoryBrowse';
import Compare from './pages/Compare';
import SearchResults from './pages/SearchResults';
import Watchlist from './pages/Watchlist';
import MyReviews from './pages/MyReviews';
import RecentlyViewed from './pages/RecentlyViewed';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminReviews from './pages/admin/AdminReviews';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<ErrorBoundary><Home /></ErrorBoundary>} />
          <Route path="product/:id" element={<ErrorBoundary><ProductDetail /></ErrorBoundary>} />
          <Route path="categories" element={<ErrorBoundary><CategoryBrowse key="categories" /></ErrorBoundary>} />
          <Route path="top-rated" element={<ErrorBoundary><CategoryBrowse key="top-rated" /></ErrorBoundary>} />
          <Route path="compare" element={<ErrorBoundary><Compare /></ErrorBoundary>} />
          <Route path="search" element={<ErrorBoundary><SearchResults /></ErrorBoundary>} />
          <Route path="watchlist" element={<ErrorBoundary><Watchlist /></ErrorBoundary>} />
          <Route path="my-reviews" element={<ErrorBoundary><MyReviews /></ErrorBoundary>} />
          <Route path="recently-viewed" element={<ErrorBoundary><RecentlyViewed /></ErrorBoundary>} />
          <Route path="profile" element={<ErrorBoundary><Profile /></ErrorBoundary>} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="reviews" element={<AdminReviews />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
