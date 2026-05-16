import express from 'express';
import { supabase } from '../supabaseClient.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('users').select('id, email, display_name');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

router.post('/', async (req, res) => {
  const { email, display_name } = req.body;
  const { data, error } = await supabase.from('users').insert([{ email, display_name }]);

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data?.[0] || null);
});

export default router;
