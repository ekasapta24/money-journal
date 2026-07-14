import { Router } from 'express';
import pool from '../config/db.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);

// GET /api/recap/monthly?month=2026-07
router.get('/monthly', async (req, res) => {
  const { month } = req.query;
  const [rows] = await pool.query(
    `SELECT
       SUM(CASE WHEN jenis != 'investasi' THEN nominal ELSE 0 END) AS pengeluaran,
       kategori
     FROM transactions
     WHERE user_id = ? AND DATE_FORMAT(tanggal, "%Y-%m") = ?
     GROUP BY kategori`,
    [req.userId, month]
  );
  res.json(rows);
});

// GET /api/recap/yearly?year=2026
router.get('/yearly', async (req, res) => {
  const { year } = req.query;
  const [[totals]] = await pool.query(
    `SELECT SUM(nominal) AS total_pengeluaran, COUNT(*) AS jumlah_transaksi
     FROM transactions WHERE user_id = ? AND YEAR(tanggal) = ?`,
    [req.userId, year]
  );
  res.json(totals);
});

// GET /api/insight/monthly?month=2026-07
router.get('/insight/monthly', async (req, res) => {
  const { month } = req.query;

  const [[favoritKategori]] = await pool.query(
    `SELECT kategori, COUNT(*) AS jumlah FROM transactions
     WHERE user_id = ? AND DATE_FORMAT(tanggal, "%Y-%m") = ?
     GROUP BY kategori ORDER BY jumlah DESC LIMIT 1`,
    [req.userId, month]
  );

  const [[palingDisesali]] = await pool.query(
    `SELECT t.kategori, AVG(r.rating) AS rata_rating FROM transactions t
     JOIN reviews r ON r.transaction_id = t.id
     WHERE t.user_id = ? AND DATE_FORMAT(t.tanggal, "%Y-%m") = ?
     GROUP BY t.kategori ORDER BY rata_rating ASC LIMIT 1`,
    [req.userId, month]
  );

  res.json({
    kategori_favorit: favoritKategori || null,
    kategori_paling_disesali: palingDisesali || null
  });
});

export default router;
