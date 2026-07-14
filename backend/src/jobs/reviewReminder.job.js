import cron from 'node-cron';
import pool from '../config/db.js';

// Job ini dijalankan di EC2 - cek setiap hari jam 08:00
// transaksi mana yang sudah lewat reminder_date dan belum direview
export function startReviewReminderJob() {
  cron.schedule('0 8 * * *', async () => {
    try {
      const [pending] = await pool.query(
        `SELECT t.id, t.judul, t.user_id FROM transactions t
         LEFT JOIN reviews r ON r.transaction_id = t.id
         WHERE t.reminder_date <= CURDATE() AND r.id IS NULL`
      );
      console.log(`[EC2 cron] ${pending.length} transaksi siap direview.`);
      // TODO: kirim notifikasi (email/push) ke user, atau cukup andalkan
      // endpoint GET /api/reviews/pending yang dicek saat user buka app
    } catch (err) {
      console.error('[EC2 cron] Gagal cek reminder review:', err.message);
    }
  });
  console.log('Review reminder job aktif (setiap hari jam 08:00).');
}
