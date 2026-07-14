import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, BookOpen, Star, TrendingUp } from 'lucide-react';
import api from '../api/client';
import BottomNav from '../components/BottomNav';

const MOOD_EMOJI = { senang: '😊', biasa: '🙂', netral: '😐', sedih: '😞' };
const JENIS_LABEL = { kebutuhan: 'Kebutuhan', keinginan: 'Keinginan', investasi: 'Investasi' };
const JENIS_COLOR = { kebutuhan: 'bg-sage-dark', keinginan: 'bg-clay', investasi: 'bg-sage' };

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bulanIni, setBulanIni] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const bulan = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    api.get(`/transactions?bulan=${bulan}`).then(({ data }) => {
      setBulanIni(data);
      setLoading(false);
    });
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const total = bulanIni.reduce((sum, t) => sum + Number(t.nominal), 0);
  const perJenis = ['kebutuhan', 'keinginan', 'investasi'].map((j) => ({
    jenis: j,
    total: bulanIni.filter((t) => t.jenis === j).reduce((sum, t) => sum + Number(t.nominal), 0)
  }));

  const moodCounts = bulanIni.reduce((acc, t) => {
    if (t.mood) acc[t.mood] = (acc[t.mood] || 0) + 1;
    return acc;
  }, {});
  const moodDominan = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <div className="min-h-screen px-6 py-10 pb-24 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono text-[11px] tracking-[0.2em] text-ink-soft uppercase mb-1">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <h1 className="font-display text-2xl text-ink">Halo, {user?.nama?.split(' ')[0] || 'kamu'}</h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-ink-soft border border-line rounded-full px-3 py-1.5 hover:bg-card transition-colors"
        >
          Keluar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <Link to="/tambah" className="bg-sage-dark text-card rounded-card p-5 hover:bg-sage transition-colors">
          <div className="w-9 h-9 rounded-lg bg-card/15 flex items-center justify-center mb-3">
            <Plus size={18} strokeWidth={1.75} />
          </div>
          <p className="text-sm font-medium">Tambah transaksi</p>
        </Link>
        <Link to="/timeline" className="bg-card border border-line rounded-card p-5 hover:bg-paper transition-colors">
          <div className="w-9 h-9 rounded-lg bg-paper border border-line flex items-center justify-center mb-3">
            <BookOpen size={18} strokeWidth={1.75} className="text-ink-soft" />
          </div>
          <p className="text-sm font-medium text-ink">Timeline</p>
        </Link>
      </div>

      <Link to="/review" className="block bg-card border border-line rounded-card p-5 mb-3 hover:bg-paper transition-colors">
        <p className="text-sm font-medium text-ink mb-1 flex items-center gap-2">
          <Star size={15} strokeWidth={1.75} className="text-clay" /> Review pembelian
        </p>
        <p className="text-xs text-ink-soft">Cek transaksi lama yang siap direfleksikan.</p>
      </Link>

      <div className="bg-card border border-line rounded-card p-5 mb-3">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={15} strokeWidth={1.75} className="text-ink-soft" />
          <p className="text-xs font-medium text-ink-soft uppercase tracking-wide">Ringkasan bulan ini</p>
        </div>

        {loading ? (
          <p className="text-xs text-ink-soft py-4">Memuat...</p>
        ) : bulanIni.length === 0 ? (
          <p className="text-xs text-ink-soft py-4">Belum ada transaksi bulan ini.</p>
        ) : (
          <>
            <p className="font-mono text-xl text-ink mt-2 mb-4">{formatRupiah(total)}</p>

            <div className="space-y-2.5 mb-4">
              {perJenis.map(({ jenis, total: jTotal }) => {
                const pct = total > 0 ? Math.round((jTotal / total) * 100) : 0;
                return (
                  <div key={jenis}>
                    <div className="flex justify-between text-[11px] text-ink-soft mb-1">
                      <span>{JENIS_LABEL[jenis]}</span>
                      <span className="font-mono">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-paper border border-line rounded-full overflow-hidden">
                      <div className={`h-full ${JENIS_COLOR[jenis]} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {moodDominan && (
              <p className="text-xs text-ink-soft border-t border-line pt-3">
                Rasa yang paling sering muncul bulan ini {MOOD_EMOJI[moodDominan]}
              </p>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
