import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';

import authRoutes from './routes/auth.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import tagRoutes from './routes/tag.routes.js';
import reviewRoutes from './routes/review.routes.js';
import goalRoutes from './routes/goal.routes.js';
import recapRoutes from './routes/recap.routes.js';
import { startReviewReminderJob } from './jobs/reviewReminder.job.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/recap', recapRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

async function testDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Berhasil terhubung ke MySQL');
    connection.release();
  } catch (err) {
    console.error('❌ Gagal konek ke MySQL');
    console.error(err.message);
  }
}

testDatabase();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Money Journal API jalan di http://localhost:${PORT}`);
  startReviewReminderJob();
});
