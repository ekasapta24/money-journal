import { useEffect, useState } from 'react';
import api from '../api/client';
import BottomNav from '../components/BottomNav';

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

export default function Insight() {
  const [recap, setRecap] = useState([]);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const month = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    Promise.all([
      api.get(`/recap/monthly?month=${month}`),
      api.get(`/recap/insight/monthly?month=${month}`)
    ]).then(([r1, r2]) => {
      setRecap(r1.data);
      setInsight(r2.data);
      setLoading(false);
    });
  }, []);

  const total = recap.reduce((sum, r) => sum + Number(r.pengeluaran || 0), 0);
  const monthLabel = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen px-6 py-10 pb-24 max-w-md mx-auto">
      <h1 className="font-display text-2xl text-ink mb-1">Insight</h1>
      <p className="text-sm text-ink-soft mb-6">{monthLabel}</p>

      {loading && <p className="text-sm text-ink-soft text-center py-10">Memuat...</p>}

      {!loading && (
        <div className="space-y-4">
          <div className="bg-sage-dark text-card rounded-card p-5">
            <p className="text-xs text-card/70 mb-1">Total pengeluaran bulan ini</p>
            <p className="font-display text-2xl">{formatRupiah(total)}</p>
          </div>

          {recap.length > 0 && (
            <div className="bg-card border border-line rounded-card p-5">
              <p className="text-xs font-medium text-ink-soft mb-3 uppercase tracking-wide">Kategori terbesar</p>
              <div className="space-y-2">
                {recap
                  .sort((a, b) => b.pengeluaran - a.pengeluaran)
                  .map((r) => (
                    <div key={r.kategori} className="flex justify-between text-sm">
                      <span className="text-ink">{r.kategori}</span>
                      <span className="text-ink-soft font-mono">{formatRupiah(r.pengeluaran)}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="bg-clay/10 border border-clay/25 rounded-card p-5">
            <p className="text-xs font-medium text-ink-soft mb-3 uppercase tracking-wide">Ciri khas bulan ini</p>
            {insight?.kategori_favorit ? (
              <p className="text-sm text-ink mb-2">
                Kategori favoritmu: <span className="font-medium">{insight.kategori_favorit.kategori}</span>
              </p>
            ) : (
              <p className="text-sm text-ink-soft mb-2">Belum cukup data untuk kategori favorit.</p>
            )}
            {insight?.kategori_paling_disesali ? (
              <p className="text-sm text-ink">
                Paling sering disesali: <span className="font-medium">{insight.kategori_paling_disesali.kategori}</span>
              </p>
            ) : (
              <p className="text-sm text-ink-soft">Belum ada review untuk dianalisis.</p>
            )}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
