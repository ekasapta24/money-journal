import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

function ReviewForm({ transaksi, onDone }) {
  const [rating, setRating] = useState(0);
  const [pelajaran, setPelajaran] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    await api.post('/reviews', { transaction_id: transaksi.id, rating, pelajaran });
    setSaving(false);
    onDone(transaksi.id);
  }

  return (
    <div className="bg-card border border-line rounded-card p-5">
      <p className="text-sm font-medium text-ink">{transaksi.judul}</p>
      <p className="text-xs text-ink-soft font-mono mb-4">{formatRupiah(transaksi.nominal)}</p>

      <p className="text-xs text-ink-soft mb-2">Apakah pembelian ini masih bermanfaat bagimu?</p>
      <div className="flex gap-1.5 text-xl mb-4">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n} type="button" onClick={() => setRating(n)}
            className={n <= rating ? 'text-clay' : 'text-line'}
            aria-label={`${n} bintang`}
          >
            ★
          </button>
        ))}
      </div>

      <p className="text-xs text-ink-soft mb-1.5">Apa pelajaranmu?</p>
      <textarea
        value={pelajaran} onChange={(e) => setPelajaran(e.target.value)}
        rows={2}
        placeholder="Opsional..."
        className="w-full bg-paper border border-line rounded-lg px-3 py-2 text-sm text-ink mb-3"
      />

      <button
        onClick={submit} disabled={saving || rating === 0}
        className="w-full bg-sage-dark text-card rounded-lg py-2 text-sm font-medium hover:bg-sage transition-colors disabled:opacity-50"
      >
        {saving ? 'Menyimpan...' : 'Simpan review'}
      </button>
    </div>
  );
}

export default function ReviewPembelian() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reviews/pending').then(({ data }) => {
      setPending(data);
      setLoading(false);
    });
  }, []);

  function handleDone(id) {
    setPending((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="min-h-screen px-6 py-10 pb-24 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-2">
        <Link to="/" className="text-ink-soft hover:text-ink text-sm">←</Link>
        <h1 className="font-display text-2xl text-ink">Review pembelian</h1>
      </div>
      <p className="text-sm text-ink-soft mb-6">Sudah 30 hari sejak transaksi ini. Masih bermanfaat?</p>

      {loading && <p className="text-sm text-ink-soft text-center py-10">Memuat...</p>}

      {!loading && pending.length === 0 && (
        <p className="text-sm text-ink-soft text-center py-14">Tidak ada review yang perlu diselesaikan saat ini.</p>
      )}

      <div className="space-y-4">
        {pending.map((t) => (
          <ReviewForm key={t.id} transaksi={t} onDone={handleDone} />
        ))}
      </div>
    </div>
  );
}
