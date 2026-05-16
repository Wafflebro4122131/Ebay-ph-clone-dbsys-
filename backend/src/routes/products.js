import express from 'express';
import { supabase, supabaseReady } from '../supabaseClient.js';

const router = express.Router();

const fallbackProducts = [
  {
    product_id: 1,
    product_name: 'Samsung Galaxy A54',
    product_brand: 'Samsung',
    product_description: 'Mid-range smartphone with great battery life and camera.',
    product_price: 15999,
    product_category: 'Electronics',
    product_condition: 'New',
    image_url: 'https://images.pexels.com/photos/6078126/pexels-photo-6078126.jpeg',
    seller_id: 1,
    created_at: new Date().toISOString(),
  },
  {
    product_id: 2,
    product_name: 'Nike Air Max Sneakers',
    product_brand: 'Nike',
    product_description: 'Comfortable and stylish running shoes for everyday wear.',
    product_price: 4200,
    product_category: 'Fashion',
    product_condition: 'New',
    image_url: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg',
    seller_id: 2,
    created_at: new Date().toISOString(),
  },
];

router.get('/', async (req, res) => {
  if (!supabaseReady) {
    return res.json(fallbackProducts);
  }

  const { category, search } = req.query;
  let query = supabase.from('product').select('*').order('product_id', { ascending: false });

  if (category) {
    query = query.eq('product_category', category);
  }

  if (search) {
    query = query.ilike('product_name', `%${search}%`);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  res.json(data || []);
});

router.get('/:id', async (req, res) => {
  if (!supabaseReady) {
    const product = fallbackProducts.find((item) => item.product_id === Number(req.params.id));
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json(product);
  }

  const { id } = req.params;
  const { data, error } = await supabase.from('product').select('*').eq('product_id', id).single();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Product not found' });

  res.json(data);
});

router.post('/', async (req, res) => {
  if (!supabaseReady) {
    return res.status(501).json({ error: 'Database not configured. Cannot create product.' });
  }

  const { product_name, product_description, product_price, image_url, product_category, product_brand, product_condition, seller_id } = req.body;
  const { data, error } = await supabase.from('product').insert([
    {
      product_name,
      product_description,
      product_price,
      image_url,
      product_category,
      product_brand,
      product_condition,
      seller_id,
    },
  ]).select('*').single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

export default router;

router.get('/:id', async (req, res) => {
  if (!supabaseReady) {
    const product = fallbackProducts.find((item) => item.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json(product);
  }

  const { id } = req.params;
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Product not found' });

  res.json(data);
});

router.post('/', async (req, res) => {
  if (!supabaseReady) {
    return res.status(501).json({ error: 'Database not configured. Cannot create product.' });
  }

  const { title, description, price, image_url, category, seller_id } = req.body;
  const { data, error } = await supabase.from('products').insert([
    { title, description, price, image_url, category, seller_id },
  ]);

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data?.[0] || null);
});

export default router;
