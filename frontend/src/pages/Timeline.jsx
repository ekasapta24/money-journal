import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, UtensilsCrossed, Car, BookOpen, Clapperboard, Home, Package } from 'lucide-react';
import api from '../api/client';
import BottomNav from '../components/BottomNav';

const KATEGORI_ICON = {
  Makanan: UtensilsCrossed, Transportasi: Car, Pendidikan: BookOpen,
  Hiburan: Clapperboard, Kos: Home, Lainnya: Package
};

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })
    .format(n).replace('Rp', 'Rp ');
}

function groupByMonth(items) {
  const groups = [];
  const map = new Map();
  for (const t of items) {
    const d = new Date(t.tanggal);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const label = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).toUpperCase();
    if (!map.has(key)) {
      const group = { label, items: [] };
      map.set(key, group);
      groups.push(group);
    }
    map.get(key).items.push(t);
  }
  return groups;
}

export default function Timeline() {
  const [transaksi, setTransaksi] = useState([]);
  const [cari, setCari] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/transactions').then(({ data }) => {
      setTransaksi(data);
      setLoading(false);
    });
  }, []);

  const filtered = cari
    ? transaksi.filter((t) => t.judul.toLowerCase().includes(cari.toLowerCase()) || t.kategori.toLowerCase().includes(cari.toLowerCase()))
    : transaksi;

  const groups = groupByMonth(filtered);

  return (
    <div className="min-h-screen px-6 py-10 pb-24 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-7">
        <Link to="/" className="text-ink-soft hover:text-ink transition-colors">
          <ArrowLeft size={20} strokeWidth={1.75} />
        </Link>
        <h1 className="font-display text-3xl text-ink">Timeline</h1>
      </div>

      <input
        value={cari} onChange={(e) => setCari(e.target.value)}
        placeholder="Cari judul atau kategori..."
        className="w-full bg-card border border-line rounded-lg px-4 py-3 text-sm text-ink placeholder:text-ink-soft/60 mb-8"
      />

      {loading && <p className="text-sm text-ink-soft text-center py-10">Memuat...</p>}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-14">
          <p className="text-sm text-ink-soft">Belum ada catatan di sini.</p>
          <Link to="/tambah" className="text-sage-dark text-sm font-medium hover:underline mt-2 inline-block">
            + Tambah transaksi pertama
          </Link>
        </div>
      )}

      <div className="space-y-8">
        {groups.map((group) => (
          <div key={group.label} className="relative">
            {/* rail line spanning the month's entries */}
            <div className="absolute left-[19px] top-[28px] bottom-2 w-px bg-line" />

            <div className="flex items-center gap-4 mb-4 relative">
              <div className="w-10 flex justify-center shrink-0">
                <span className="w-3 h-3 rounded-full bg-ink block ring-4 ring-paper" />
              </div>
              <h2 className="font-display text-lg text-ink tracking-[0.08em]">{group.label}</h2>
            </div>

            <div className="space-y-3">
              {group.items.map((t) => {
                const Icon = KATEGORI_ICON[t.kategori] || Package;
                return (
                  <div key={t.id} className="flex gap-4 items-start relative">
                    <div className="w-10 flex justify-center shrink-0 pt-6">
                      <span className="w-2 h-2 rounded-full bg-sage-dark block ring-4 ring-paper" />
                    </div>
                    <Link
                      to={`/transaksi/${t.id}`}
                      className="flex-1 bg-card border border-line rounded-card p-4 min-w-0 hover:bg-paper transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-paper border border-line flex items-center justify-center shrink-0">
                          <Icon size={16} strokeWidth={1.75} className="text-ink-soft" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between items-start gap-3">
                            <p className="text-sm font-medium text-ink truncate">{t.judul}</p>
                            <p className="text-sm font-medium text-ink font-mono whitespace-nowrap">{formatRupiah(t.nominal)}</p>
                          </div>
                          {t.catatan && (
                            <p className="text-xs text-ink-soft italic mt-1 truncate">&ldquo;{t.catatan}&rdquo;</p>
                          )}
                          <p className="text-[11px] text-ink-soft/70 mt-1.5 font-mono">
                            {new Date(t.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Link
        to="/tambah"
        className="fixed bottom-24 right-6 w-[52px] h-[52px] bg-sage-dark text-card rounded-full flex items-center justify-center shadow-lg hover:bg-sage transition-colors"
        aria-label="Tambah transaksi"
      >
        <Plus size={22} strokeWidth={2} />
      </Link>

      <BottomNav />
    </div>
  );
}
