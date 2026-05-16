import express from 'express';
import { supabase, supabaseReady } from '../supabaseClient.js';

const router = express.Router();

const fallbackUsers = [
  {
    user_id: 1,
    user_firstname: 'Seller',
    user_lastname: 'One',
    user_email: 'seller1@example.com',
    user_phonenumber: '+639171234567',
  },
  {
    user_id: 2,
    user_firstname: 'Seller',
    user_lastname: 'Two',
    user_email: 'seller2@example.com',
    user_phonenumber: '+639181234567',
  },
];

router.get('/', async (req, res) => {
  if (!supabaseReady) {
    return res.json(fallbackUsers);
  }

  const { data, error } = await supabase
    .from('user_profile')
    .select('user_id, user_firstname, user_lastname, user_email, user_phonenumber');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

router.post('/', async (req, res) => {
  if (!supabaseReady) {
    return res.status(501).json({ error: 'Database not configured. Cannot create user.' });
  }

  const { email, display_name } = req.body;
  const [firstName, lastName] = (display_name || '').split(' ');
  const { data, error } = await supabase.from('user_profile').insert([
    {
      user_firstname: firstName || display_name,
      user_lastname: lastName || '',
      user_email: email,
      user_password: '',
    },
  ]);

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data?.[0] || null);
});

export default router;
