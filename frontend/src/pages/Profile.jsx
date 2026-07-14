import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, LogOut, BookOpen, Lock, Pencil, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import BottomNav from '../components/BottomNav';

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ entri: 0, targetTercapai: 0, totalTarget: 0 });

  const [editingEmail, setEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/transactions'), api.get('/goals')]).then(([tx, goals]) => {
      setStats({
        entri: tx.data.length,
        targetTercapai: goals.data.filter((g) => Number(g.current) >= Number(g.target)).length,
        totalTarget: goals.data.length
      });
    });
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function startEditEmail() {
    setEmailInput(user?.email || '');
    setEmailError('');
    setEditingEmail(true);
  }

  async function handleSaveEmail() {
    setEmailError('');
    setSavingEmail(true);
    try {
      const { data } = await api.put('/auth/email', { email: emailInput });
      updateUser(data.user);
      setEditingEmail(false);
    } catch (err) {
      setEmailError(err.response?.data?.message || 'Gagal memperbarui email.');
    } finally {
      setSavingEmail(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    setSavingPassword(true);
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      setPasswordSuccess('Password berhasil diubah.');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => {
        setChangingPassword(false);
        setPasswordSuccess('');
      }, 1200);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Gagal mengubah password.');
    } finally {
      setSavingPassword(false);
    }
  }

  const initial = user?.nama?.charAt(0).toUpperCase() || '?';

  return (
    <div className="min-h-screen px-6 py-10 pb-24 max-w-md mx-auto">
      <h1 className="font-display text-2xl text-ink mb-6">Profil</h1>

      <div className="bg-sage-dark rounded-card p-5 relative overflow-hidden mb-4">
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" aria-hidden="true" />

        <div className="flex justify-between items-start mb-5">
          <div>
            <p className="text-[10px] tracking-[0.15em] text-card/60 font-mono uppercase">Money Journal</p>
            <p className="text-[10px] text-card/50">Kartu anggota jurnal</p>
          </div>
          <BookOpen size={20} className="text-card/60" strokeWidth={1.5} />
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-sage flex items-center justify-center font-display text-lg text-card">
            {initial}
          </div>
          <div>
            <p className="text-sm font-medium text-card">{user?.nama}</p>
            <p className="text-[11px] text-card/50">Anggota jurnal</p>
          </div>
        </div>

        <div className="flex justify-between border-t border-white/15 pt-3">
          <div>
            <p className="text-base font-medium text-card font-mono">{stats.entri}</p>
            <p className="text-[10px] text-card/50">Entri jurnal</p>
          </div>
          <div>
            <p className="text-base font-medium text-card font-mono">{stats.targetTercapai}/{stats.totalTarget || 0}</p>
            <p className="text-[10px] text-card/50">Target tercapai</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-line rounded-card overflow-hidden mb-3">
        <p className="font-display text-base text-ink px-4 pt-4 pb-3">Pengaturan Akun</p>

        <div className="divide-y divide-line border-t border-line">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2.5 text-sm text-ink shrink-0">
                <Mail size={16} strokeWidth={1.75} className="text-ink-soft" /> Email
              </span>
              {!editingEmail ? (
                <button
                  onClick={startEditEmail}
                  className="flex items-center gap-1.5 text-xs text-ink-soft hover:text-ink transition-colors"
                >
                  {user?.email}
                  <Pencil size={12} strokeWidth={1.75} />
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <input
                    type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)}
                    className="w-36 bg-paper border border-line rounded-md px-2 py-1 text-xs text-ink"
                  />
                  <button
                    onClick={handleSaveEmail} disabled={savingEmail}
                    className="w-6 h-6 flex items-center justify-center rounded-full text-sage-dark hover:bg-sage/15 transition-colors disabled:opacity-50"
                    aria-label="Simpan email"
                  >
                    <Check size={14} strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => setEditingEmail(false)}
                    className="w-6 h-6 flex items-center justify-center rounded-full text-ink-soft hover:bg-paper transition-colors"
                    aria-label="Batal"
                  >
                    <X size={14} strokeWidth={2} />
                  </button>
                </div>
              )}
            </div>
            {emailError && <p className="text-[11px] text-red-700 mt-1.5">{emailError}</p>}
          </div>

          <div className="px-4 py-3">
            <button
              onClick={() => setChangingPassword((v) => !v)}
              className="w-full flex items-center justify-between gap-3"
            >
              <span className="flex items-center gap-2.5 text-sm text-ink">
                <Lock size={16} strokeWidth={1.75} className="text-ink-soft" /> Keamanan
              </span>
              <span className="text-xs text-ink-soft">Ubah kata sandi</span>
            </button>

            {changingPassword && (
              <form onSubmit={handleChangePassword} className="mt-3 space-y-2">
                <input
                  required type="password" placeholder="Password lama"
                  value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-paper border border-line rounded-lg px-3 py-2 text-xs text-ink placeholder:text-ink-soft/60"
                />
                <input
                  required type="password" placeholder="Password baru"
                  value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-paper border border-line rounded-lg px-3 py-2 text-xs text-ink placeholder:text-ink-soft/60"
                />
                {passwordError && <p className="text-[11px] text-red-700">{passwordError}</p>}
                {passwordSuccess && <p className="text-[11px] text-sage-dark">{passwordSuccess}</p>}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setChangingPassword(false)}
                    className="flex-1 border border-line text-ink-soft rounded-lg py-2 text-xs font-medium hover:bg-paper transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit" disabled={savingPassword}
                    className="flex-1 bg-sage-dark text-card rounded-lg py-2 text-xs font-medium hover:bg-sage transition-colors disabled:opacity-60"
                  >
                    {savingPassword ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2.5 bg-[#B5615C] text-card rounded-card py-3.5 text-sm font-medium hover:bg-[#a5544f] transition-colors mb-4"
      >
        <LogOut size={16} strokeWidth={1.75} /> Keluar
      </button>

      <BottomNav />
    </div>
  );
}
