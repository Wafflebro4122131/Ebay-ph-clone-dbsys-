import { useEffect, useMemo, useState } from 'react';
import { fetchProducts } from './services/api';
import { login, signup } from './services/auth';
import AuthForm from './components/AuthForm';
import ProductCard from './components/ProductCard';

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('browse');
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('ebayPHUser');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    setLoading(true);
    const query = {
      search: search || undefined,
      category: category !== 'all' ? category : undefined,
    };

    fetchProducts({ backendUrl, search: query.search, category: query.category })
      .then((data) => {
        setProducts(data || []);
        setError(null);
      })
      .catch((err) => setError(err.message || 'Unable to load products'))
      .finally(() => setLoading(false));
  }, [search, category]);

  const categories = useMemo(() => {
    const unique = new Set(products.map((item) => item.product_category).filter(Boolean));
    return ['all', ...Array.from(unique)];
  }, [products]);

  const handleLogin = async (credentials) => {
    const user = await login(credentials);
    setUser(user);
    localStorage.setItem('ebayPHUser', JSON.stringify(user));
    setView('browse');
  };

  const handleSignup = async (data) => {
    const user = await signup(data);
    setUser(user);
    localStorage.setItem('ebayPHUser', JSON.stringify(user));
    setView('browse');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ebayPHUser');
  };

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <div className="brand-block">
          <div className="brand-icon">e</div>
          <div>
            <h1>eBay PH Clone</h1>
            <p>Buy, sell, and discover trusted listings.</p>
          </div>
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              <span className="user-badge">Hi, {user.user_firstname}</span>
              <button className="nav-button" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <button className="nav-button ghost" onClick={() => setView('login')}>
                Sign in
              </button>
              <button className="nav-button" onClick={() => setView('signup')}>
                Register
              </button>
            </>
          )}
        </div>
      </nav>

      {view !== 'browse' ? (
        <AuthForm
          mode={view}
          onSwitchMode={() => setView(view === 'login' ? 'signup' : 'login')}
          onSuccess={view === 'login' ? handleLogin : handleSignup}
        />
      ) : (
        <>
          <header className="hero-panel">
            <div className="hero-copy">
              <p className="eyebrow">eBay Philippines Replica</p>
              <h2>Shop trusted bargains and sell with confidence.</h2>
              <p>
                Browse featured listings, compare prices, and find sellers across popular Filipino categories.
                Log in to manage your profile, post new products, and save your favorites.
              </p>
            </div>
            <div className="hero-search">
              <input
                type="text"
                placeholder="Search for electronics, fashion, gadgets…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
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
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>
          </main>
        </>
      )}
    </div>
  );
}

export default App;
