import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2, ImagePlus } from 'lucide-react';
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

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })
    .format(n).replace('Rp', 'Rp ');
}

export default function TransaksiDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [transaksi, setTransaksi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [judul, setJudul] = useState('');
  const [nominal, setNominal] = useState('');
  const [kategori, setKategori] = useState(KATEGORI[0]);
  const [jenis, setJenis] = useState('kebutuhan');
  const [mood, setMood] = useState('biasa');
  const [catatan, setCatatan] = useState('');
  const [tanggal, setTanggal] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    api.get(`/transactions/${id}`).then(({ data }) => {
      setTransaksi(data);
      setJudul(data.judul);
      setNominal(String(data.nominal));
      setKategori(data.kategori);
      setJenis(data.jenis);
      setMood(data.mood || 'biasa');
      setCatatan(data.catatan || '');
      setTanggal(new Date(data.tanggal).toISOString().slice(0, 10));
      setLoading(false);
    }).catch(() => {
      setError('Transaksi tidak ditemukan.');
      setLoading(false);
    });
  }, [id]);

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.put(`/transactions/${id}`, {
        judul, nominal: Number(nominal), kategori, jenis, mood, catatan, tanggal
      });

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        await api.post(`/transactions/${id}/receipt`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      const { data } = await api.get(`/transactions/${id}`);
      setTransaksi(data);
      setFile(null);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan perubahan.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Hapus transaksi ini? Tindakan ini tidak bisa dibatalkan.')) return;
    try {
      await api.delete(`/transactions/${id}`);
      navigate('/timeline');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus transaksi.');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen px-6 py-10 max-w-md mx-auto">
        <p className="text-sm text-ink-soft text-center py-10">Memuat...</p>
      </div>
    );
  }

  if (!transaksi) {
    return (
      <div className="min-h-screen px-6 py-10 max-w-md mx-auto">
        <Link to="/timeline" className="text-ink-soft hover:text-ink text-sm">← Kembali</Link>
        <p className="text-sm text-ink-soft text-center py-10">{error || 'Transaksi tidak ditemukan.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10 pb-16 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-3">
          <Link to="/timeline" className="text-ink-soft hover:text-ink transition-colors">
            <ArrowLeft size={20} strokeWidth={1.75} />
          </Link>
          <h1 className="font-display text-3xl text-ink">
            {editing ? 'Edit transaksi' : 'Detail transaksi'}
          </h1>
        </div>
        {!editing && (
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-line text-ink-soft hover:text-ink hover:bg-card transition-colors"
              aria-label="Edit transaksi"
            >
              <Pencil size={15} strokeWidth={1.75} />
            </button>
            <button
              onClick={handleDelete}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-line text-ink-soft hover:text-red-700 hover:bg-card transition-colors"
              aria-label="Hapus transaksi"
            >
              <Trash2 size={15} strokeWidth={1.75} />
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{error}</p>
      )}

      {!editing ? (
        <div className="space-y-4">
          <div className="bg-card border border-line rounded-card p-5">
            <p className="text-xs text-ink-soft mb-1">{kategori} · {JENIS.find((j) => j.value === jenis)?.label}</p>
            <h2 className="font-display text-xl text-ink mb-3">{transaksi.judul}</h2>
            <p className="text-2xl font-mono font-medium text-ink mb-3">{formatRupiah(transaksi.nominal)}</p>
            {transaksi.catatan && (
              <p className="text-sm text-ink-soft italic mb-3">&ldquo;{transaksi.catatan}&rdquo;</p>
            )}
            <div className="flex items-center gap-3 text-xs text-ink-soft">
              <span className="font-mono">
                {new Date(transaksi.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              {transaksi.mood && <span className="text-base">{MOOD.find((m) => m.value === transaksi.mood)?.emoji}</span>}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-ink-soft mb-2">Bukti struk</p>
            {transaksi.attachment_url ? (
              <a href={transaksi.attachment_url} target="_blank" rel="noreferrer" className="block rounded-card overflow-hidden border border-line">
                <img src={transaksi.attachment_url} alt="Struk transaksi" className="w-full object-cover max-h-80" />
              </a>
            ) : (
              <div className="border border-dashed border-line rounded-card py-8 text-center text-xs text-ink-soft">
                Belum ada foto struk.
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1.5">Judul</label>
            <input
              required value={judul} onChange={(e) => setJudul(e.target.value)}
              className="w-full bg-card border border-line rounded-lg px-3.5 py-2.5 text-sm text-ink"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1.5">Nominal</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-ink-soft font-mono">Rp</span>
              <input
                required type="number" value={nominal} onChange={(e) => setNominal(e.target.value)}
                className="w-full bg-card border border-line rounded-lg pl-9 pr-3.5 py-2.5 text-sm text-ink font-mono"
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
              rows={3}
              className="w-full bg-card border border-line rounded-lg px-3.5 py-2.5 text-sm text-ink"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1.5">
              Struk <span className="text-ink-soft/60">(kosongkan jika tidak diganti)</span>
            </label>
            {transaksi.attachment_url && !file && (
              <img src={transaksi.attachment_url} alt="Struk saat ini" className="w-full object-cover max-h-40 rounded-lg border border-line mb-2" />
            )}
            <label className="flex items-center justify-center gap-2 border border-dashed border-line rounded-lg py-4 cursor-pointer bg-card hover:bg-paper transition-colors">
              <ImagePlus size={16} strokeWidth={1.75} className="text-ink-soft" />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
              <span className="text-xs text-ink-soft">{file ? file.name : 'Ganti foto struk'}</span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="flex-1 border border-line text-ink rounded-lg py-2.5 text-sm font-medium hover:bg-card transition-colors"
            >
              Batal
            </button>
            <button
              type="submit" disabled={saving}
              className="flex-1 bg-sage-dark text-card rounded-lg py-2.5 text-sm font-medium hover:bg-sage transition-colors disabled:opacity-60"
            >
              {saving ? 'Menyimpan...' : 'Simpan perubahan'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
