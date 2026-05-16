import { useState, useEffect, useMemo } from 'react';
import { supabase } from './utils/supabase';

const initialCheckout = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  country: '',
  postal_code: '',
};

export default function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [checkoutData, setCheckoutData] = useState(initialCheckout);
  const [checkoutState, setCheckoutState] = useState('idle');
  const [checkoutError, setCheckoutError] = useState(null);

  useEffect(() => {
    async function loadProducts() {
      const { data, error } = await supabase
        .from('product')
        .select(
          'product_id, product_name, product_brand, product_price, product_category, product_condition, product_description'
        );

      if (error) {
        setError(error.message);
      } else {
        setProducts(data ?? []);
      }
      setLoading(false);
    }

    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const unique = new Set(products.map((product) => product.product_category || '').filter(Boolean));
    return ['All', ...Array.from(unique).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = category === 'All' || product.product_category === category;
      const matchesSearch = search
        ? product.product_name.toLowerCase().includes(search.toLowerCase()) ||
          product.product_brand?.toLowerCase().includes(search.toLowerCase())
        : true;
      return matchesCategory && matchesSearch;
    });
  }, [products, category, search]);

  const handleBuyNow = (product) => {
    setCheckoutError(null);
    setSelectedProduct(product);
    setCheckoutState('form');
  };

  const handleCheckoutChange = (event) => {
    const { name, value } = event.target;
    setCheckoutData((prev) => ({ ...prev, [name]: value }));
  };

  const createOrGetUser = async () => {
    const { data: existingUser, error: fetchError } = await supabase
      .from('user_profile')
      .select('*')
      .eq('user_email', checkoutData.email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(fetchError.message || 'Unable to retrieve user');
    }

    if (existingUser) {
      return existingUser;
    }

    const { data: newUser, error: insertError } = await supabase
      .from('user_profile')
      .insert([
        {
          user_firstname: checkoutData.first_name || 'Guest',
          user_lastname: checkoutData.last_name || 'Buyer',
          user_phonenumber: checkoutData.phone || '',
          user_email: checkoutData.email || `guest_${Date.now()}@example.com`,
          user_password: 'guest-password',
        },
      ])
      .select('*')
      .single();

    if (insertError) {
      throw new Error(insertError.message || 'Unable to create user profile');
    }

    return newUser;
  };

  const handleSubmitOrder = async () => {
    if (!selectedProduct) return;
    setCheckoutState('submitting');
    setCheckoutError(null);

    try {
      const user = await createOrGetUser();

      const { data: address, error: addressError } = await supabase
        .from('address')
        .insert([
          {
            user_id: user.user_id,
            address_street: checkoutData.street,
            address_city: checkoutData.city,
            address_country: checkoutData.country,
            address_postalcode: checkoutData.postal_code,
          },
        ])
        .select('*')
        .single();

      if (addressError) {
        throw new Error(addressError.message || 'Unable to save address');
      }

      const { data: order, error: orderError } = await supabase
        .from('orderlist')
        .insert([
          {
            user_id: user.user_id,
            address_id: address.address_id,
          },
        ])
        .select('*')
        .single();

      if (orderError) {
        throw new Error(orderError.message || 'Unable to create order');
      }

      const { error: orderProductError } = await supabase.from('order_product').insert([
        {
          order_id: order.order_id,
          product_id: selectedProduct.product_id,
          orderproduct_quantity: 1,
        },
      ]);

      if (orderProductError) {
        throw new Error(orderProductError.message || 'Unable to save order items');
      }

      setCheckoutState('success');
    } catch (err) {
      setCheckoutError(err.message || 'Checkout failed');
      setCheckoutState('form');
    }
  };

  const resetCheckout = () => {
    setSelectedProduct(null);
    setCheckoutData(initialCheckout);
    setCheckoutState('idle');
    setCheckoutError(null);
  };

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <div className="brand-block">
          <div className="brand-icon">E</div>
          <div>
            <h1>EbayPh</h1>
            <p>Philippines online marketplace</p>
          </div>
        </div>
        <div className="nav-actions">
          <button className="nav-button ghost">Sign in</button>
          <button className="nav-button">Register</button>
        </div>
      </nav>

      <header className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Philippines</p>
          <h2>Find trusted deals, local sellers, and everyday essentials.</h2>
          <p>
            Browse featured listings across electronics, fashion, home, and more. Purchase with confidence from verified sellers in the Philippines.
          </p>
          <div className="hero-search">
            <input
              type="search"
              placeholder="Search for phones, gadgets, sneakers, furniture…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="hero-details">
          <div className="hero-stat">
            <span>24k+</span>
            <p>Active listings</p>
          </div>
          <div className="hero-stat">
            <span>8.5k</span>
            <p>Trusted sellers</p>
          </div>
          <div className="hero-stat">
            <span>1.2M</span>
            <p>Monthly visits</p>
          </div>
        </div>
      </header>

      <section className="category-bar">
        <div className="category-label">Popular categories:</div>
        <div className="category-list">
          {categories.map((item) => (
            <button
              key={item}
              className={item === category ? 'category-button active' : 'category-button'}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="status-message">Loading marketplace listings…</div>
      ) : error ? (
        <div className="status-message error">{error}</div>
      ) : (
        <div className="content-grid">
          <main className="products-column">
            {filteredProducts.length === 0 ? (
              <div className="status-message">No listings match your search.</div>
            ) : (
              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <article key={product.product_id} className="product-card">
                    <div className="product-card-top">
                      <div className="product-badge">{product.product_category || 'Other'}</div>
                      <span className="product-condition">{product.product_condition || 'Condition unknown'}</span>
                    </div>
                    <div className="product-card-content">
                      <h3>{product.product_name}</h3>
                      <p>{product.product_brand || 'Brand not specified'}</p>
                      <p className="product-description">{product.product_description || 'No description available.'}</p>
                    </div>
                    <div className="product-card-footer">
                      <span className="price">₱{product.product_price}</span>
                      <button className="buy-button" onClick={() => handleBuyNow(product)}>
                        Buy now
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>

          {selectedProduct && (
            <aside className="checkout-panel">
              {checkoutState === 'success' ? (
                <div className="order-success">
                  <h2>Thank you for your purchase</h2>
                  <p>
                    Your order for <strong>{selectedProduct.product_name}</strong> is confirmed. You will receive a confirmation email shortly.
                  </p>
                  <button className="secondary-button" onClick={resetCheckout}>
                    Back to marketplace
                  </button>
                </div>
              ) : (
                <div className="checkout-card">
                  <div className="checkout-header">
                    <h2>Checkout</h2>
                    <span>{selectedProduct.product_category || 'Listing'}</span>
                  </div>
                  <div className="checkout-product">
                    <h3>{selectedProduct.product_name}</h3>
                    <p>{selectedProduct.product_brand || 'Brand not specified'}</p>
                    <span className="checkout-price">₱{selectedProduct.product_price}</span>
                  </div>
                  <form className="checkout-form" onSubmit={(e) => e.preventDefault()}>
                    <div className="input-grid">
                      <label>
                        First name
                        <input name="first_name" value={checkoutData.first_name} onChange={handleCheckoutChange} required />
                      </label>
                      <label>
                        Last name
                        <input name="last_name" value={checkoutData.last_name} onChange={handleCheckoutChange} required />
                      </label>
                    </div>
                    <label>
                      Email address
                      <input type="email" name="email" value={checkoutData.email} onChange={handleCheckoutChange} required />
                    </label>
                    <label>
                      Phone number
                      <input name="phone" value={checkoutData.phone} onChange={handleCheckoutChange} required />
                    </label>
                    <label>
                      Street address
                      <input name="street" value={checkoutData.street} onChange={handleCheckoutChange} required />
                    </label>
                    <div className="input-grid">
                      <label>
                        City
                        <input name="city" value={checkoutData.city} onChange={handleCheckoutChange} required />
                      </label>
                      <label>
                        Country
                        <input name="country" value={checkoutData.country} onChange={handleCheckoutChange} required />
                      </label>
                    </div>
                    <label>
                      Postal code
                      <input name="postal_code" value={checkoutData.postal_code} onChange={handleCheckoutChange} required />
                    </label>
                    {checkoutError && <div className="status-message error">{checkoutError}</div>}
                    <button className="primary-button" type="button" onClick={handleSubmitOrder} disabled={checkoutState === 'submitting'}>
                      {checkoutState === 'submitting' ? 'Processing order…' : 'Place order'}
                    </button>
                    <button className="secondary-button" type="button" onClick={resetCheckout}>
                      Cancel
                    </button>
                  </form>
                </div>
              )}
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
