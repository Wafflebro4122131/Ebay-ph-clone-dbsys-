import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { category, search } = req.query;
  let query = supabase.from('products').select('*').order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  if (search) {
    query = query.ilike('title', `%${search}%`);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  res.json(data || []);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Product not found' });

  res.json(data);
});

router.post('/', async (req, res) => {
  const { title, description, price, image_url, category, seller_id } = req.body;
  const { data, error } = await supabase.from('products').insert([
    { title, description, price, image_url, category, seller_id },
  ]);

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data?.[0] || null);
});

export default router;
