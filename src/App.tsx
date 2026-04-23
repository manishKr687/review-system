import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import CategoryBrowse from './pages/CategoryBrowse';
import Compare from './pages/Compare';
import SearchResults from './pages/SearchResults';
import Watchlist from './pages/Watchlist';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="categories" element={<CategoryBrowse />} />
          <Route path="compare" element={<Compare />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="watchlist" element={<Watchlist />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
