import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);

// GET /api/tags
router.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM tags ORDER BY nama');
  res.json(rows);
});

// GET /api/tags/:nama/transactions - cari transaksi berdasarkan nama tag
router.get('/:nama/transactions', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT t.* FROM transactions t
     JOIN transaction_tags tt ON tt.transaction_id = t.id
     JOIN tags g ON g.id = tt.tag_id
     WHERE g.nama = ? AND t.user_id = ?
     ORDER BY t.tanggal DESC`,
    [req.params.nama, req.userId]
  );
  res.json(rows);
});

// POST /api/transactions/:transactionId/tags - tambah tag ke transaksi (helper, dipanggil dari frontend)
router.post('/attach/:transactionId', async (req, res) => {
  try {
    const { nama } = req.body;
    let [existing] = await pool.query('SELECT id FROM tags WHERE nama = ?', [nama]);

    let tagId;
    if (existing.length > 0) {
      tagId = existing[0].id;
    } else {
      tagId = uuidv4();
      await pool.query('INSERT INTO tags (id, nama) VALUES (?, ?)', [tagId, nama]);
    }

    await pool.query(
      'INSERT IGNORE INTO transaction_tags (transaction_id, tag_id) VALUES (?, ?)',
      [req.params.transactionId, tagId]
    );

    res.status(201).json({ message: 'Tag ditambahkan.', tagId });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menambah tag.', error: err.message });
  }
});

export default router;
