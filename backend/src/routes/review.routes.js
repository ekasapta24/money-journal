import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);

// GET /api/reviews/pending - transaksi yang siap direview (reminder_date sudah lewat, belum ada review)
router.get('/pending', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT t.* FROM transactions t
     LEFT JOIN reviews r ON r.transaction_id = t.id
     WHERE t.user_id = ? AND t.reminder_date <= CURDATE() AND r.id IS NULL
     ORDER BY t.reminder_date ASC`,
    [req.userId]
  );
  res.json(rows);
});

// POST /api/reviews
router.post('/', async (req, res) => {
  try {
    const { transaction_id, rating, pelajaran } = req.body;
    const id = uuidv4();
    await pool.query(
      'INSERT INTO reviews (id, transaction_id, rating, pelajaran) VALUES (?, ?, ?, ?)',
      [id, transaction_id, rating, pelajaran]
    );
    res.status(201).json({ message: 'Review disimpan.', id });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menyimpan review.', error: err.message });
  }
});

export default router;
