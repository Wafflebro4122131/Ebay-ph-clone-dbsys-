import { useState, useEffect } from 'react';
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

  const handleBuyNow = (product) => {
    setCheckoutError(null);
    setSelectedProduct(product);
    setCheckoutState('form');
  };

  const handleChange = (event) => {
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
      throw new Error(insertError.message || 'Unable to create guest user');
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

  if (loading) {
    return <div>Loading products from Supabase...</div>;
  }

  if (error) {
    return <div>Error loading products: {error}</div>;
  }

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>eBay PH Supabase Products</h1>

      {selectedProduct ? (
        <div style={{ maxWidth: 720, marginTop: 24 }}>
          {checkoutState === 'success' ? (
            <div style={{ padding: 24, border: '1px solid #d0f0d4', borderRadius: 14, background: '#f0fff4' }}>
              <h2>Thank you for your purchase!</h2>
              <p>
                Your order for <strong>{selectedProduct.product_name}</strong> has been placed successfully.
              </p>
              <button onClick={resetCheckout} style={{ marginTop: 16, padding: '10px 18px', borderRadius: 10, border: 'none', background: '#0f172a', color: 'white', cursor: 'pointer' }}>
                Back to products
              </button>
            </div>
          ) : (
            <div style={{ padding: 24, border: '1px solid #d0d7de', borderRadius: 14, background: '#ffffff' }}>
              <h2>Checkout: {selectedProduct.product_name}</h2>
              <p style={{ marginTop: 0 }}>{selectedProduct.product_description}</p>
              <p>
                <strong>Price:</strong> ₱{selectedProduct.product_price}
              </p>
              <div style={{ display: 'grid', gap: 12, marginTop: 18 }}>
                <label>
                  First name
                  <input name="first_name" value={checkoutData.first_name} onChange={handleChange} style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 10, border: '1px solid #cbd5e1' }} />
                </label>
                <label>
                  Last name
                  <input name="last_name" value={checkoutData.last_name} onChange={handleChange} style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 10, border: '1px solid #cbd5e1' }} />
                </label>
                <label>
                  Email
                  <input name="email" value={checkoutData.email} onChange={handleChange} style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 10, border: '1px solid #cbd5e1' }} />
                </label>
                <label>
                  Phone
                  <input name="phone" value={checkoutData.phone} onChange={handleChange} style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 10, border: '1px solid #cbd5e1' }} />
                </label>
                <label>
                  Street address
                  <input name="street" value={checkoutData.street} onChange={handleChange} style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 10, border: '1px solid #cbd5e1' }} />
                </label>
                <label>
                  City
                  <input name="city" value={checkoutData.city} onChange={handleChange} style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 10, border: '1px solid #cbd5e1' }} />
                </label>
                <label>
                  Country
                  <input name="country" value={checkoutData.country} onChange={handleChange} style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 10, border: '1px solid #cbd5e1' }} />
                </label>
                <label>
                  Postal code
                  <input name="postal_code" value={checkoutData.postal_code} onChange={handleChange} style={{ width: '100%', padding: 10, marginTop: 6, borderRadius: 10, border: '1px solid #cbd5e1' }} />
                </label>
              </div>

              {checkoutError && <p style={{ color: '#b91c1c' }}>{checkoutError}</p>}

              <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
                <button
                  onClick={handleSubmitOrder}
                  disabled={checkoutState === 'submitting'}
                  style={{ padding: '12px 20px', borderRadius: 10, border: 'none', background: '#0064d2', color: 'white', cursor: 'pointer' }}
                >
                  {checkoutState === 'submitting' ? 'Processing...' : 'Confirm purchase'}
                </button>
                <button
                  onClick={resetCheckout}
                  style={{ padding: '12px 20px', borderRadius: 10, border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, marginTop: 24 }}>
          {products.map((product) => (
            <li
              key={product.product_id}
              style={{
                marginBottom: 18,
                padding: 18,
                border: '1px solid #d0d7de',
                borderRadius: 12,
                display: 'grid',
                gap: 10,
              }}
            >
              <div>
                <h2 style={{ margin: '0 0 8px' }}>{product.product_name}</h2>
                <p style={{ margin: '0 0 6px', color: '#475569' }}>
                  {product.product_brand || 'Brand not set'} · {product.product_category || 'No category'} · {product.product_condition || 'Condition unknown'}
                </p>
                <p style={{ margin: '0 0 6px' }}>{product.product_description}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                <strong>₱{product.product_price}</strong>
                <button
                  onClick={() => handleBuyNow(product)}
                  style={{ padding: '12px 18px', borderRadius: 10, border: 'none', background: '#0064d2', color: 'white', cursor: 'pointer' }}
                >
                  Buy now
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
