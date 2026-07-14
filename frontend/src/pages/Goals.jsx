import { useEffect, useState } from 'react';
import { Smartphone, BookOpen, Plane, Target as TargetIcon, Pencil, Trash2 } from 'lucide-react';
import api from '../api/client';
import BottomNav from '../components/BottomNav';

const KATEGORI_GOAL = ['Elektronik', 'Pendidikan', 'Liburan', 'Lainnya'];
const KATEGORI_ICON = {
  Elektronik: Smartphone, Pendidikan: BookOpen, Liburan: Plane, Lainnya: TargetIcon
};

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
}

function IconPicker({ kategori, onChange }) {
  const [open, setOpen] = useState(false);
  const Icon = KATEGORI_ICON[kategori] || TargetIcon;

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-11 h-11 rounded-lg bg-paper border border-line flex items-center justify-center hover:bg-sage/10 transition-colors"
        aria-label="Ganti kategori"
      >
        <Icon size={18} strokeWidth={1.75} className="text-ink-soft" />
      </button>
      {open && (
        <div className="absolute z-10 top-12 left-0 bg-card border border-line rounded-lg p-1.5 flex gap-1 shadow-lg">
          {KATEGORI_GOAL.map((k) => {
            const KIcon = KATEGORI_ICON[k];
            return (
              <button
                key={k} type="button"
                onClick={() => { onChange(k); setOpen(false); }}
                title={k}
                className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${
                  k === kategori ? 'bg-sage/20 text-sage-dark' : 'text-ink-soft hover:bg-paper'
                }`}
              >
                <KIcon size={15} strokeWidth={1.75} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function GoalCard({ goal, onUpdate, onKategoriChange, onEdit, onDelete }) {
  const [adding, setAdding] = useState('');
  const [editing, setEditing] = useState(false);
  const [editNama, setEditNama] = useState(goal.nama);
  const [editTarget, setEditTarget] = useState(String(goal.target));
  const [saving, setSaving] = useState(false);
  const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));

  async function handleAdd() {
    if (!adding) return;
    const newCurrent = Number(goal.current) + Number(adding);
    const { data } = await api.put(`/goals/${goal.id}`, { current: newCurrent });
    onUpdate(goal.id, newCurrent, data.justCompleted);
    setAdding('');
  }

  async function handleSaveEdit() {
    setSaving(true);
    try {
      const { data } = await api.put(`/goals/${goal.id}/edit`, { nama: editNama, target: Number(editTarget) });
      onEdit(goal.id, editNama, Number(editTarget), data.justCompleted);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (window.confirm(`Hapus target "${goal.nama}"? Tindakan ini tidak bisa dibatalkan.`)) {
      onDelete(goal.id);
    }
  }

  return (
    <div className="bg-card border border-line rounded-card p-5">
      <div className="flex gap-3 mb-3">
        <IconPicker kategori={goal.kategori} onChange={(k) => onKategoriChange(goal.id, k)} />
        <div className="flex-1 min-w-0">
          {!editing ? (
            <>
              <div className="flex justify-between items-center gap-2 mb-2">
                <p className="text-sm font-medium text-ink truncate">{goal.nama}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-ink-soft font-mono">{pct}%</span>
                  <button onClick={() => setEditing(true)} aria-label="Edit target" className="text-ink-soft hover:text-ink transition-colors">
                    <Pencil size={13} strokeWidth={1.75} />
                  </button>
                  <button onClick={handleDelete} aria-label="Hapus target" className="text-ink-soft hover:text-red-700 transition-colors">
                    <Trash2 size={13} strokeWidth={1.75} />
                  </button>
                </div>
              </div>
              <div className="h-2 bg-paper border border-line rounded-full overflow-hidden mb-2">
                <div className="h-full bg-sage rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-ink-soft font-mono">
                {formatRupiah(goal.current)} / {formatRupiah(goal.target)}
              </p>
            </>
          ) : (
            <div className="space-y-2">
              <input
                value={editNama} onChange={(e) => setEditNama(e.target.value)}
                className="w-full bg-paper border border-line rounded-lg px-3 py-1.5 text-sm text-ink"
              />
              <input
                type="number" value={editTarget} onChange={(e) => setEditTarget(e.target.value)}
                className="w-full bg-paper border border-line rounded-lg px-3 py-1.5 text-sm text-ink font-mono"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditing(false); setEditNama(goal.nama); setEditTarget(String(goal.target)); }}
                  className="flex-1 border border-line text-ink-soft rounded-lg py-1.5 text-xs font-medium hover:bg-paper transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveEdit} disabled={saving}
                  className="flex-1 bg-sage-dark text-card rounded-lg py-1.5 text-xs font-medium hover:bg-sage transition-colors disabled:opacity-60"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {!editing && (
        <div className="flex gap-2">
          <input
            type="number" value={adding} onChange={(e) => setAdding(e.target.value)}
            placeholder="Tambah tabungan"
            className="flex-1 bg-paper border border-line rounded-lg px-3 py-1.5 text-xs text-ink font-mono"
          />
          <button
            onClick={handleAdd}
            className="text-xs bg-sage-dark text-card rounded-lg px-3 py-1.5 hover:bg-sage transition-colors"
          >
            Tambah
          </button>
        </div>
      )}
    </div>
  );
}

function CompletedGoalCard({ goal, onKategoriChange, onRefleksiSave, onEdit, onDelete }) {
  const [editingRefleksi, setEditingRefleksi] = useState(false);
  const [refleksi, setRefleksi] = useState(goal.refleksi || '');
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editNama, setEditNama] = useState(goal.nama);
  const [editTarget, setEditTarget] = useState(String(goal.target));
  const [savingEdit, setSavingEdit] = useState(false);

  async function handleSaveRefleksi() {
    setSaving(true);
    try {
      await api.put(`/goals/${goal.id}/refleksi`, { refleksi });
      onRefleksiSave(goal.id, refleksi);
      setEditingRefleksi(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEdit() {
    setSavingEdit(true);
    try {
      await api.put(`/goals/${goal.id}/edit`, { nama: editNama, target: Number(editTarget) });
      onEdit(goal.id, editNama, Number(editTarget));
      setEditing(false);
    } finally {
      setSavingEdit(false);
    }
  }

  function handleDelete() {
    if (window.confirm(`Hapus riwayat "${goal.nama}"? Tindakan ini tidak bisa dibatalkan.`)) {
      onDelete(goal.id);
    }
  }

  return (
    <div className="bg-card border border-line rounded-card p-5">
      <div className="flex gap-3">
        <IconPicker kategori={goal.kategori} onChange={(k) => onKategoriChange(goal.id, k)} />
        <div className="flex-1 min-w-0">
          {!editing ? (
            <>
              <div className="flex justify-between items-start gap-2 mb-2">
                <p className="text-sm font-medium text-ink truncate">{goal.nama}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] bg-sage-dark text-card rounded-full px-2.5 py-0.5">Selesai</span>
                  <button onClick={() => setEditing(true)} aria-label="Edit target" className="text-ink-soft hover:text-ink transition-colors">
                    <Pencil size={13} strokeWidth={1.75} />
                  </button>
                  <button onClick={handleDelete} aria-label="Hapus riwayat" className="text-ink-soft hover:text-red-700 transition-colors">
                    <Trash2 size={13} strokeWidth={1.75} />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 flex-1 bg-paper border border-line rounded-full overflow-hidden">
                  <div className="h-full bg-sage rounded-full w-full" />
                </div>
                {goal.completed_at && (
                  <span className="text-[11px] text-ink-soft font-mono whitespace-nowrap">
                    {new Date(goal.completed_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-soft font-mono">
                {formatRupiah(goal.current)} / {formatRupiah(goal.target)}
              </p>
            </>
          ) : (
            <div className="space-y-2">
              <input
                value={editNama} onChange={(e) => setEditNama(e.target.value)}
                className="w-full bg-paper border border-line rounded-lg px-3 py-1.5 text-sm text-ink"
              />
              <input
                type="number" value={editTarget} onChange={(e) => setEditTarget(e.target.value)}
                className="w-full bg-paper border border-line rounded-lg px-3 py-1.5 text-sm text-ink font-mono"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditing(false); setEditNama(goal.nama); setEditTarget(String(goal.target)); }}
                  className="flex-1 border border-line text-ink-soft rounded-lg py-1.5 text-xs font-medium hover:bg-paper transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveEdit} disabled={savingEdit}
                  className="flex-1 bg-sage-dark text-card rounded-lg py-1.5 text-xs font-medium hover:bg-sage transition-colors disabled:opacity-60"
                >
                  {savingEdit ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {!editing && (
        <div className="mt-3 pt-3 border-t border-line">
          {!editingRefleksi ? (
            goal.refleksi ? (
              <button onClick={() => setEditingRefleksi(true)} className="text-left w-full">
                <p className="text-xs text-ink"><span className="font-medium">Refleksi:</span> {goal.refleksi}</p>
              </button>
            ) : (
              <button
                onClick={() => setEditingRefleksi(true)}
                className="text-xs text-sage-dark font-medium hover:underline"
              >
                + Tambah refleksi
              </button>
            )
          ) : (
            <div className="space-y-2">
              <textarea
                value={refleksi} onChange={(e) => setRefleksi(e.target.value)}
                placeholder="Apa yang kamu pelajari dari proses menabung ini? (opsional)"
                rows={2}
                className="w-full bg-paper border border-line rounded-lg px-3 py-2 text-xs text-ink placeholder:text-ink-soft/60"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditingRefleksi(false); setRefleksi(goal.refleksi || ''); }}
                  className="flex-1 border border-line text-ink-soft rounded-lg py-1.5 text-xs font-medium hover:bg-paper transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveRefleksi} disabled={saving}
                  className="flex-1 bg-sage-dark text-card rounded-lg py-1.5 text-xs font-medium hover:bg-sage transition-colors disabled:opacity-60"
                >
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [nama, setNama] = useState('');
  const [target, setTarget] = useState('');
  const [kategori, setKategori] = useState(KATEGORI_GOAL[0]);

  useEffect(() => {
    api.get('/goals').then(({ data }) => setGoals(data));
  }, []);

  function isCompleted(g) {
    return !!g.completed_at || Number(g.current) >= Number(g.target);
  }

  function handleUpdate(id, newCurrent, justCompleted) {
    setGoals((prev) => prev.map((g) => (
      g.id === id
        ? { ...g, current: newCurrent, completed_at: justCompleted ? new Date().toISOString() : g.completed_at }
        : g
    )));
  }

  function handleKategoriChange(id, k) {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, kategori: k } : g)));
    api.put(`/goals/${id}/kategori`, { kategori: k });
  }

  function handleRefleksiSave(id, refleksi) {
    setGoals((prev) => prev.map((g) => (g.id === id ? { ...g, refleksi } : g)));
  }

  function handleEdit(id, nama, target, justCompleted) {
    setGoals((prev) => prev.map((g) => (
      g.id === id
        ? { ...g, nama, target, completed_at: justCompleted && !g.completed_at ? new Date().toISOString() : g.completed_at }
        : g
    )));
  }

  async function handleDelete(id) {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    await api.delete(`/goals/${id}`);
  }

  async function handleCreate(e) {
    e.preventDefault();
    const { data } = await api.post('/goals', { nama, target: Number(target), kategori });
    setGoals((prev) => [...prev, { id: data.id, nama, target: Number(target), current: 0, kategori, completed_at: null, refleksi: '' }]);
    setNama(''); setTarget(''); setKategori(KATEGORI_GOAL[0]); setShowForm(false);
  }

  const active = goals.filter((g) => !isCompleted(g));
  const completed = goals.filter(isCompleted);

  return (
    <div className="min-h-screen px-6 py-10 pb-24 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-ink">Goals</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="text-xs text-sage-dark font-medium border border-sage/40 rounded-full px-3 py-1.5 hover:bg-sage/10 transition-colors"
        >
          {showForm ? 'Batal' : '+ Target baru'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-card border border-line rounded-card p-5 mb-4 space-y-3">
          <input
            required value={nama} onChange={(e) => setNama(e.target.value)}
            placeholder="Nama target, misal: Laptop"
            className="w-full bg-paper border border-line rounded-lg px-3 py-2 text-sm text-ink"
          />
          <input
            required type="number" value={target} onChange={(e) => setTarget(e.target.value)}
            placeholder="Target nominal"
            className="w-full bg-paper border border-line rounded-lg px-3 py-2 text-sm text-ink font-mono"
          />
          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1.5">Kategori</label>
            <div className="flex gap-2">
              {KATEGORI_GOAL.map((k) => {
                const KIcon = KATEGORI_ICON[k];
                return (
                  <button
                    type="button" key={k} onClick={() => setKategori(k)}
                    className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border text-[11px] transition-colors ${
                      kategori === k ? 'bg-sage/15 border-sage text-sage-dark font-medium' : 'border-line text-ink-soft'
                    }`}
                  >
                    <KIcon size={16} strokeWidth={1.75} />
                    {k}
                  </button>
                );
              })}
            </div>
          </div>
          <button type="submit" className="w-full bg-sage-dark text-card rounded-lg py-2 text-sm font-medium hover:bg-sage transition-colors">
            Buat target
          </button>
        </form>
      )}

      {goals.length === 0 && !showForm && (
        <p className="text-sm text-ink-soft text-center py-14">Belum ada target tabungan.</p>
      )}

      <div className="space-y-3">
        {active.map((g) => (
          <GoalCard
            key={g.id} goal={g}
            onUpdate={handleUpdate} onKategoriChange={handleKategoriChange}
            onEdit={handleEdit} onDelete={handleDelete}
          />
        ))}
      </div>

      {completed.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-xl text-ink mb-4">Riwayat Impian</h2>
          <div className="space-y-3">
            {completed.map((g) => (
              <CompletedGoalCard
                key={g.id} goal={g}
                onKategoriChange={handleKategoriChange}
                onRefleksiSave={handleRefleksiSave}
                onEdit={handleEdit} onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
