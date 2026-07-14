import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import pool from '../config/db.js';
import s3Client, { BUCKET_NAME } from '../config/s3.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

// GET /api/transactions?bulan=2026-07&kategori=Pendidikan
router.get('/', async (req, res) => {
  try {
    const { bulan, kategori } = req.query;
    let query = 'SELECT * FROM transactions WHERE user_id = ?';
    const params = [req.userId];

    if (bulan) {
      query += ' AND DATE_FORMAT(tanggal, "%Y-%m") = ?';
      params.push(bulan);
    }
    if (kategori) {
      query += ' AND kategori = ?';
      params.push(kategori);
    }
    query += ' ORDER BY tanggal DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil transaksi.', error: err.message });
  }
});

// GET /api/transactions/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Transaksi tidak ditemukan.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil transaksi.', error: err.message });
  }
});

// POST /api/transactions
router.post('/', async (req, res) => {
  try {
    const { judul, nominal, kategori, jenis, mood, catatan, tanggal } = req.body;
    const id = uuidv4();

    const reminderDate = new Date(tanggal);
    reminderDate.setDate(reminderDate.getDate() + 30);

    await pool.query(
      `INSERT INTO transactions (id, user_id, judul, nominal, kategori, jenis, mood, catatan, tanggal, reminder_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, req.userId, judul, nominal, kategori, jenis, mood, catatan, tanggal, reminderDate]
    );

    res.status(201).json({ message: 'Transaksi disimpan.', id });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menyimpan transaksi.', error: err.message });
  }
});

// PUT /api/transactions/:id
router.put('/:id', async (req, res) => {
  try {
    const { judul, nominal, kategori, jenis, mood, catatan, tanggal } = req.body;
    const [result] = await pool.query(
      `UPDATE transactions SET judul=?, nominal=?, kategori=?, jenis=?, mood=?, catatan=?, tanggal=?
       WHERE id=? AND user_id=?`,
      [judul, nominal, kategori, jenis, mood, catatan, tanggal, req.params.id, req.userId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Transaksi tidak ditemukan.' });
    res.json({ message: 'Transaksi diperbarui.' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal memperbarui transaksi.', error: err.message });
  }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM transactions WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Transaksi tidak ditemukan.' });
    res.json({ message: 'Transaksi dihapus.' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menghapus transaksi.', error: err.message });
  }
});

// POST /api/transactions/:id/receipt - upload struk ke S3
router.post('/:id/receipt', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File tidak ditemukan.' });

    const key = `receipts/${req.userId}/${req.params.id}-${Date.now()}-${req.file.originalname}`;

    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    }));

    const url = process.env.AWS_S3_ENDPOINT
      ? `${process.env.AWS_S3_ENDPOINT}/${BUCKET_NAME}/${key}`
      : `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;

    await pool.query(
      'UPDATE transactions SET attachment_url = ? WHERE id = ? AND user_id = ?',
      [url, req.params.id, req.userId]
    );

    res.json({ message: 'Struk berhasil diupload.', url });
  } catch (err) {
    res.status(500).json({ message: 'Gagal upload struk.', error: err.message });
  }
});

export default router;