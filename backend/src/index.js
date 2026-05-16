import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import productsRouter from './routes/products.js';
import usersRouter from './routes/users.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '0.1.0' });
});

app.use('/api/products', productsRouter);
app.use('/api/users', usersRouter);

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
