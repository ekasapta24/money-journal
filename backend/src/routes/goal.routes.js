import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM goals WHERE user_id = ?', [req.userId]);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { nama, target, kategori } = req.body;
  const id = uuidv4();
  await pool.query(
    'INSERT INTO goals (id, user_id, nama, target, current, kategori) VALUES (?, ?, ?, ?, 0, ?)',
    [id, req.userId, nama, target, kategori || 'Lainnya']
  );
  res.status(201).json({ message: 'Target dibuat.', id });
});

router.put('/:id', async (req, res) => {
  const { current } = req.body;
  const [rows] = await pool.query(
    'SELECT target, completed_at FROM goals WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId]
  );
  if (rows.length === 0) return res.status(404).json({ message: 'Target tidak ditemukan.' });

  const alreadyCompleted = rows[0].completed_at;
  const justCompleted = !alreadyCompleted && Number(current) >= Number(rows[0].target);

  await pool.query(
    `UPDATE goals SET current = ?${justCompleted ? ', completed_at = NOW()' : ''} WHERE id = ? AND user_id = ?`,
    [current, req.params.id, req.userId]
  );
  res.json({ message: 'Progress diperbarui.', justCompleted });
});

router.put('/:id/kategori', async (req, res) => {
  const { kategori } = req.body;
  const [result] = await pool.query(
    'UPDATE goals SET kategori = ? WHERE id = ? AND user_id = ?',
    [kategori, req.params.id, req.userId]
  );
  if (result.affectedRows === 0) return res.status(404).json({ message: 'Target tidak ditemukan.' });
  res.json({ message: 'Kategori diperbarui.' });
});

router.put('/:id/refleksi', async (req, res) => {
  const { refleksi } = req.body;
  const [result] = await pool.query(
    'UPDATE goals SET refleksi = ? WHERE id = ? AND user_id = ?',
    [refleksi, req.params.id, req.userId]
  );
  if (result.affectedRows === 0) return res.status(404).json({ message: 'Target tidak ditemukan.' });
  res.json({ message: 'Refleksi disimpan.' });
});

router.put('/:id/edit', async (req, res) => {
  const { nama, target } = req.body;
  const [rows] = await pool.query(
    'SELECT current FROM goals WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId]
  );
  if (rows.length === 0) return res.status(404).json({ message: 'Target tidak ditemukan.' });

  const justCompleted = Number(rows[0].current) >= Number(target);
  await pool.query(
    `UPDATE goals SET nama = ?, target = ?${justCompleted ? ', completed_at = COALESCE(completed_at, NOW())' : ''} WHERE id = ? AND user_id = ?`,
    [nama, target, req.params.id, req.userId]
  );
  res.json({ message: 'Target diperbarui.', justCompleted });
});

router.delete('/:id', async (req, res) => {
  const [result] = await pool.query('DELETE FROM goals WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
  if (result.affectedRows === 0) return res.status(404).json({ message: 'Target tidak ditemukan.' });
  res.json({ message: 'Target dihapus.' });
});

export default router;
