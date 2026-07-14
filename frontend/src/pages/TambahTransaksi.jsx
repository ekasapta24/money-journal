import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';

const KATEGORI = ['Makanan', 'Transportasi', 'Pendidikan', 'Hiburan', 'Kos', 'Lainnya'];
const JENIS = [
  { value: 'kebutuhan', label: 'Kebutuhan' },
  { value: 'keinginan', label: 'Keinginan' },
  { value: 'investasi', label: 'Investasi' }
];
const MOOD = [
  { value: 'senang', emoji: '😊' },
  { value: 'biasa', emoji: '🙂' },
  { value: 'netral', emoji: '😐' },
  { value: 'sedih', emoji: '😞' }
];

export default function TambahTransaksi() {
  const [judul, setJudul] = useState('');
  const [nominal, setNominal] = useState('');
  const [kategori, setKategori] = useState(KATEGORI[0]);
  const [jenis, setJenis] = useState('kebutuhan');
  const [mood, setMood] = useState('biasa');
  const [catatan, setCatatan] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/transactions', {
        judul, nominal: Number(nominal), kategori, jenis, mood, catatan, tanggal
      });

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        await api.post(`/transactions/${data.id}/receipt`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      navigate('/timeline');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan transaksi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-6 py-10 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/" className="text-ink-soft hover:text-ink text-sm">←</Link>
        <h1 className="font-display text-2xl text-ink">Tambah transaksi</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-ink-soft mb-1.5">Judul</label>
          <input
            required value={judul} onChange={(e) => setJudul(e.target.value)}
            placeholder="Buku AWS"
            className="w-full bg-card border border-line rounded-lg px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-ink-soft mb-1.5">Nominal</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-ink-soft font-mono">Rp</span>
            <input
              required type="number" value={nominal} onChange={(e) => setNominal(e.target.value)}
              placeholder="180000"
              className="w-full bg-card border border-line rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-ink font-mono placeholder:text-ink-soft/60"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1.5">Kategori</label>
            <select
              value={kategori} onChange={(e) => setKategori(e.target.value)}
              className="w-full bg-card border border-line rounded-lg px-3 py-2.5 text-sm text-ink"
            >
              {KATEGORI.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1.5">Tanggal</label>
            <input
              type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)}
              className="w-full bg-card border border-line rounded-lg px-3 py-2.5 text-sm text-ink"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-ink-soft mb-2">Jenis</label>
          <div className="flex gap-2">
            {JENIS.map((j) => (
              <button
                type="button" key={j.value} onClick={() => setJenis(j.value)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  jenis === j.value
                    ? 'bg-sage/15 border-sage text-sage-dark font-medium'
                    : 'border-line text-ink-soft'
                }`}
              >
                {j.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-ink-soft mb-2">Mood</label>
          <div className="flex gap-3 text-xl">
            {MOOD.map((m) => (
              <button
                type="button" key={m.value} onClick={() => setMood(m.value)}
                className={mood === m.value ? 'opacity-100 scale-110 transition-transform' : 'opacity-35 transition-opacity'}
                aria-label={m.value}
              >
                {m.emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-ink-soft mb-1.5">Catatan</label>
          <textarea
            value={catatan} onChange={(e) => setCatatan(e.target.value)}
            placeholder="Akhirnya mulai belajar AWS."
            rows={3}
            className="w-full bg-card border border-line rounded-lg px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-soft/60"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-ink-soft mb-1.5">
            Struk <span className="text-ink-soft/60">(tersimpan di S3)</span>
          </label>
          <label className="flex flex-col items-center justify-center border border-dashed border-line rounded-lg py-5 cursor-pointer bg-card hover:bg-paper transition-colors">
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
            <span className="text-xs text-ink-soft">{file ? file.name : 'Klik untuk pilih foto struk'}</span>
          </label>
        </div>

        {error && (
          <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          type="submit" disabled={loading}
          className="w-full bg-sage-dark text-card rounded-lg py-2.5 text-sm font-medium hover:bg-sage transition-colors disabled:opacity-60"
        >
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </form>
    </div>
  );
}
