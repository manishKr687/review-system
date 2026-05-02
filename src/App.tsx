import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import CategoryBrowse from './pages/CategoryBrowse';
import Compare from './pages/Compare';
import SearchResults from './pages/SearchResults';
import Watchlist from './pages/Watchlist';
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="categories" element={<CategoryBrowse key="categories" />} />
          <Route path="top-rated" element={<CategoryBrowse key="top-rated" />} />
          <Route path="compare" element={<Compare />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="watchlist" element={<Watchlist />} />
          <Route path="my-reviews" element={<Watchlist />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
