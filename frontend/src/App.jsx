import { useEffect, useMemo, useState } from 'react';
import { fetchProducts } from './services/api';
import ProductCard from './components/ProductCard';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const query = search || category === 'all' ? { search, category: category === 'all' ? undefined : category } : {};

    fetchProducts({ backendUrl, search: query.search, category: query.category })
      .then((data) => {
        setProducts(data || []);
        setError(null);
      })
      .catch((err) => setError(err.message || 'Unable to load products'))
      .finally(() => setLoading(false));
  }, [search, category]);

  const categories = useMemo(() => {
    const unique = new Set(products.map((item) => item.category).filter(Boolean));
    return ['all', ...Array.from(unique)];
  }, [products]);

  return (
    <div className="app-shell">
      <header className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">eBay Philippines Replica</p>
          <h1>Buy and sell modern goods with confidence</h1>
          <p>
            A polished marketplace experience built with React, Express, and Supabase.
            Discover listings, search product inventory, and explore items as if you were on a real storefront.
          </p>
          <div className="hero-actions">
            <input
              type="text"
              placeholder="Search products by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="note">Live search backed by your Supabase-powered API.</span>
          </div>
        </div>
      </header>

      <section className="category-bar">
        <div className="category-label">Filter by category:</div>
        <div className="category-list">
          {categories.map((item) => (
            <button
              key={item}
              className={item === category ? 'category-button active' : 'category-button'}
              onClick={() => setCategory(item)}
            >
              {item === 'all' ? 'All' : item}
            </button>
          ))}
        </div>
      </section>

      <main>
        {loading && <div className="status-message">Loading listings…</div>}
        {error && <div className="status-message error">{error}</div>}
        {!loading && !products.length && <div className="status-message">No products found.</div>}

        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
