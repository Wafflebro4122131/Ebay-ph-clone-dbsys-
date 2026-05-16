import express from 'express';
import bcrypt from 'bcryptjs';
import { supabase, supabaseReady } from '../supabaseClient.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  if (!supabaseReady) {
    return res.status(501).json({ error: 'Database not configured. Cannot sign up.' });
  }

  const { firstName, lastName, email, password, phone } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'Missing required signup fields.' });
  }

  const { data: existing, error: existingError } = await supabase
    .from('user_profile')
    .select('user_id')
    .eq('user_email', email)
    .single();

  if (existingError && existingError.code !== 'PGRST116') {
    return res.status(500).json({ error: existingError.message });
  }

  if (existing) {
    return res.status(409).json({ error: 'Email is already registered.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase.from('user_profile').insert([
    {
      user_firstname: firstName,
      user_lastname: lastName,
      user_email: email,
      user_password: passwordHash,
      user_phonenumber: phone,
    },
  ]).select('*').single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({
    user_id: data.user_id,
    user_firstname: data.user_firstname,
    user_lastname: data.user_lastname,
    user_email: data.user_email,
    user_phonenumber: data.user_phonenumber,
  });
});

router.post('/login', async (req, res) => {
  if (!supabaseReady) {
    return res.status(501).json({ error: 'Database not configured. Cannot log in.' });
  }

  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const { data, error } = await supabase
    .from('user_profile')
    .select('*')
    .eq('user_email', email)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(401).json({ error: 'Invalid credentials.' });

  const passwordMatch = await bcrypt.compare(password, data.user_password);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  res.json({
    user_id: data.user_id,
    user_firstname: data.user_firstname,
    user_lastname: data.user_lastname,
    user_email: data.user_email,
    user_phonenumber: data.user_phonenumber,
  });
});

export default router;
